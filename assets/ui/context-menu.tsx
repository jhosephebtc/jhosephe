import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Ellipsis } from 'lucide-react';
import type { MenuMaterial } from './menu';

export interface ContextAction { label: string; onSelect: () => void; disabled?: boolean; destructive?: boolean }

const normalizeMaterial = (material: MenuMaterial) => {
  if (material === 'liquid-glass') return 'glass';
  return material;
};

export function ContextMenu({ label = 'More actions', actions, align = 'end', material = 'solid' }: {
  label?: string; actions: ContextAction[]; align?: 'start' | 'center' | 'end'; material?: MenuMaterial;
}) {
  const finish = normalizeMaterial(material);
  return <DropdownMenu.Root>
    <DropdownMenu.Trigger className="jh-context-menu__trigger" aria-label={label}><Ellipsis size={17} strokeWidth={1.7} aria-hidden="true" /></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content
      data-jh-material={finish === 'glass' ? 'liquid-glass' : finish}
      className={`jh-menu jh-context-menu${finish === 'liquid' ? ' jh-menu--liquid' : ''}`}
      align={align}
      sideOffset={7}
      collisionPadding={12}
    >
      <DropdownMenu.Label className="jh-menu__label">{label}</DropdownMenu.Label>
      {actions.map(action => <DropdownMenu.Item key={action.label} className={`jh-menu__item ${action.destructive ? 'jh-menu__item--destructive' : ''}`} disabled={action.disabled} onSelect={action.onSelect}>{action.label}</DropdownMenu.Item>)}
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
