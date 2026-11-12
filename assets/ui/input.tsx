import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, type = 'text', ...props }, ref) {
  return <input ref={ref} type={type} className={cn('jh-input', className)} {...props} />;
});
