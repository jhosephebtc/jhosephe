import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from './utils';

export function Slider({ className, labelId, ...props }: ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { labelId: string }) {
  return (
    <SliderPrimitive.Root className={cn('jh-slider', className)} {...props}>
      <SliderPrimitive.Track className="jh-slider__track"><SliderPrimitive.Range className="jh-slider__range" /></SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="jh-slider__thumb" aria-labelledby={labelId} />
    </SliderPrimitive.Root>
  );
}

export function Switch({ className, ...props }: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return <SwitchPrimitive.Root className={cn('jh-switch', className)} {...props}><SwitchPrimitive.Thumb className="jh-switch__thumb" /></SwitchPrimitive.Root>;
}
