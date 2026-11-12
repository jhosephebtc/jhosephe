import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

export interface ContactDetails { name: string; email: string; company: string }
export function DataForm({ title = 'Your details.', description = 'A little context goes a long way.', onSubmit }: {
  title?: string; description?: string; onSubmit: (details: ContactDetails) => Promise<void> | void;
}) {
  const id = useId();
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'pending') return;
    const data = new FormData(event.currentTarget);
    setState('pending');
    try { await onSubmit({ name: String(data.get('name') || '').trim(), email: String(data.get('email') || '').trim(), company: String(data.get('company') || '').trim() }); setState('success'); }
    catch { setState('error'); }
  };
  return <form className="jh-data-form" aria-labelledby={`${id}-title`} onSubmit={submit} onChange={() => { if (state !== 'pending') setState('idle'); }}>
    <header><span className="jh-data-form__index">01 / INFORMATION</span><h2 id={`${id}-title`}>{title}</h2><p>{description}</p></header>
    <fieldset disabled={state === 'pending'}><label htmlFor={`${id}-name`}>Full name<Input id={`${id}-name`} name="name" placeholder="Alex Morgan" autoComplete="name" required maxLength={100} /></label><label htmlFor={`${id}-email`}>Email address<Input id={`${id}-email`} name="email" type="email" placeholder="alex@example.com" autoComplete="email" required maxLength={254} /></label><label htmlFor={`${id}-company`}>Company <span>(optional)</span><Input id={`${id}-company`} name="company" placeholder="Studio name" autoComplete="organization" maxLength={100} /></label></fieldset>
    <Button type="submit" variant="primary" disabled={state === 'pending'}>{state === 'pending' ? 'Saving…' : 'Save details'}{state === 'success' ? <Check size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}</Button>
    <p className="jh-data-form__status" role="status">{state === 'success' ? 'Your details have been saved.' : state === 'error' ? 'We couldn’t save your details. Please try again.' : ''}</p>
  </form>;
}
