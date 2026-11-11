import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { SmoothShape } from './smooth-shape';
import { cn } from './utils';

const variants = cva('jh-button jh-button--glass', {
  variants: {
    variant: { primary: 'jh-button--primary', secondary: 'jh-button--secondary', ghost: 'jh-button--ghost' },
    size: { default: 'jh-button--default', small: 'jh-button--small', icon: 'jh-button--icon' },
  },
  defaultVariants: { variant: 'secondary', size: 'default' },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {
  radius?: number;
  liquid?: boolean;
}

/** Glass face with local liquid feedback; semantics and focus stay on the native button. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, radius = size === 'small' ? 12 : 16, liquid = true, style, children, type = 'button', onPointerDown, ...props }, ref,
) {
  return (
    <button ref={ref} type={type} className={cn(variants({ variant, size }), className)} {...props} data-liquid={liquid} style={{ borderRadius: Number.isFinite(radius) ? Math.max(0, radius) : 16, ...style }}
      onPointerDown={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--jh-press-x', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--jh-press-y', `${event.clientY - rect.top}px`);
        onPointerDown?.(event);
      }}>
      <SmoothShape className="jh-button__face" radius={radius} />
      <span className="jh-button__content">{children}</span>
    </button>
  );
});
