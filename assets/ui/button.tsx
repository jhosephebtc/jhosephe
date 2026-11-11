import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { SmoothShape } from './smooth-shape';
import { cn } from './utils';

const variants = cva('jh-button', {
  variants: {
    variant: { primary: 'jh-button--primary', secondary: 'jh-button--secondary', ghost: 'jh-button--ghost' },
    size: { default: 'jh-button--default', small: 'jh-button--small', icon: 'jh-button--icon' },
  },
  defaultVariants: { variant: 'secondary', size: 'default' },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, children, type = 'button', ...props }, ref,
) {
  return (
    <button ref={ref} type={type} className={cn(variants({ variant, size }), className)} {...props}>
      <SmoothShape className="jh-button__face" radius={size === 'small' ? 12 : 16} />
      <span className="jh-button__content">{children}</span>
    </button>
  );
});
