import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { Check, X } from 'lucide-react';
import { ShaderSurface } from './shader-surface';
import { normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

/** One controlled notification per instance. Mount one instance near the application root. */
export function Toast({ open, onOpenChange, title, description, duration = 5000, material = 'solid' }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; duration?: number; material?: SurfaceMaterial;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);
  return <ToastPrimitive.Provider duration={duration} swipeDirection="right" label="Notification">{createPortal(<>
    <ToastPrimitive.Root data-jh-material={matAttr} className={`jh-toast${finish === 'liquid' ? ' jh-toast--liquid' : ''}`} open={open} onOpenChange={onOpenChange}>
      {finish === 'liquid' ? <ShaderSurface /> : null}
      <span className="jh-toast__icon" aria-hidden="true"><Check size={16} strokeWidth={1.65} /></span>
      <div className="jh-toast__body">
        <ToastPrimitive.Title className="jh-toast__title">{title}</ToastPrimitive.Title>
        {description ? <ToastPrimitive.Description className="jh-toast__description">{description}</ToastPrimitive.Description> : null}
      </div>
      <ToastPrimitive.Close className="jh-toast__close" aria-label="Dismiss notification"><X size={14} aria-hidden="true" /></ToastPrimitive.Close>
    </ToastPrimitive.Root><ToastPrimitive.Viewport className="jh-toast-viewport" label="Notifications ({hotkey})" />
  </>, document.body)}</ToastPrimitive.Provider>;
}
