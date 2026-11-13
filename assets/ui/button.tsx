import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { SmoothShape } from './smooth-shape';
import { cn } from './utils';

const variants = cva('jh-button jh-button--glass', {
  variants: {
    variant: {
      primary: 'jh-button--primary',
      secondary: 'jh-button--secondary',
      ghost: 'jh-button--ghost',
      working: 'jh-button--working',
    },
    size: { default: 'jh-button--default', small: 'jh-button--small', icon: 'jh-button--icon' },
  },
  defaultVariants: { variant: 'secondary', size: 'default' },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {
  radius?: number;
  smoothing?: number;
  liquid?: boolean;
  /** Shows an inline spinner, marks aria-busy, and blocks duplicate clicks. */
  loading?: boolean;
  /** Optional text shown instead of children while loading. */
  loadingLabel?: string;
}

/** Glass face with local liquid feedback; semantics and focus stay on the native button. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    radius = size === 'small' ? 12 : 16,
    smoothing = 0.6,
    liquid = true,
    loading = false,
    loadingLabel,
    disabled,
    style,
    children,
    type = 'button',
    onPointerDown,
    ...props
  },
  ref,
) {
  const isWorking = Boolean(loading || variant === 'working');
  return (
    <button
      ref={ref}
      type={type}
      className={cn(variants({ variant, size }), className)}
      {...props}
      disabled={Boolean(disabled || isWorking)}
      aria-busy={isWorking || undefined}
      data-loading={isWorking || undefined}
      data-liquid={liquid}
      style={{ borderRadius: Number.isFinite(radius) ? Math.max(0, radius) : 16, ...style }}
      onPointerDown={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--jh-press-x', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--jh-press-y', `${event.clientY - rect.top}px`);
        onPointerDown?.(event);
      }}
    >
      <SmoothShape className="jh-button__face" radius={radius} smoothing={smoothing} />
      <span className="jh-button__content">
        {isWorking ? (
          <svg className="jh-button__spinner" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" className="jh-button__spinner-track" />
            <path d="M8 2.5A5.5 5.5 0 0 1 13.5 8" className="jh-button__spinner-arc" />
          </svg>
        ) : null}
        {isWorking && loadingLabel ? loadingLabel : children}
      </span>
    </button>
  );
});
