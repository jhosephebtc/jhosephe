import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { Check, X } from 'lucide-react';

/** One controlled notification per instance. Mount one instance near the application root. */
export function Toast({ open, onOpenChange, title, description, duration = 5000 }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; duration?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ToastPrimitive.Provider duration={duration} swipeDirection="right" label="Notification">{createPortal(<>
    <ToastPrimitive.Root className="jh-toast" open={open} onOpenChange={onOpenChange}>
      <span className="jh-toast__icon" aria-hidden="true"><Check size={18} strokeWidth={1.5} /></span>
      <div><ToastPrimitive.Title className="jh-toast__title">{title}</ToastPrimitive.Title>{description && <ToastPrimitive.Description className="jh-toast__description">{description}</ToastPrimitive.Description>}</div>
      <ToastPrimitive.Close className="jh-toast__close" aria-label="Dismiss notification"><X size={15} aria-hidden="true" /></ToastPrimitive.Close>
    </ToastPrimitive.Root><ToastPrimitive.Viewport className="jh-toast-viewport" label="Notifications ({hotkey})" />
  </>, document.body)}</ToastPrimitive.Provider>;
}
