import * as MenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from './utils';

export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;
export function MenuContent({ className, sideOffset = 8, material = 'solid', ...props }: ComponentPropsWithoutRef<typeof MenuPrimitive.Content> & { material?: 'solid' | 'liquid-glass' }) {
  return <MenuPrimitive.Portal><MenuPrimitive.Content data-jh-material={material} className={cn('jh-menu', className)} sideOffset={sideOffset} collisionPadding={12} {...props} /></MenuPrimitive.Portal>;
}
export function MenuItem({ className, ...props }: ComponentPropsWithoutRef<typeof MenuPrimitive.Item>) {
  return <MenuPrimitive.Item className={cn('jh-menu__item', className)} {...props} />;
}
export function MenuLabel({ className, ...props }: ComponentPropsWithoutRef<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label className={cn('jh-menu__label', className)} {...props} />;
}
export function MenuSeparator() { return <MenuPrimitive.Separator className="jh-menu__separator" />; }
