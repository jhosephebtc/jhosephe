import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from './utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export function DialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('jh-dialog-title', className)} {...props} />;
}
export function DialogDescription({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('jh-dialog-description', className)} {...props} />;
}
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, material = 'solid', ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { material?: 'solid' | 'liquid-glass' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="jh-dialog-overlay" />
      <DialogPrimitive.Content data-jh-material={material} className={cn('jh-dialog', className)} {...props}>
        {children}
        <DialogPrimitive.Close className="jh-dialog__close" aria-label="Close"><X size={17} aria-hidden="true" /></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
