import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'examples/lab/public');
const theme = await readFile(resolve(root, 'assets/ui/theme.css'), 'utf8');
const rootBlock = theme.match(/:root\s*\{([\s\S]*?)\}/)?.[1];
if (!rootBlock) throw new Error('Tokens de tema ausentes.');
const tokens = rootBlock.split('\n').filter(line => line.trim().startsWith('--jh-')).join('\n');
const componentStart = theme.indexOf('\n.jh-button {');
if (componentStart < 0) throw new Error('Estilos dos componentes ausentes.');
// Only prefixed tokens and component styles are distributed. No reset, body or host theme.
const css = `@import "@fontsource-variable/geist";\n\n:root {\n${tokens}\n  --jh-ring: #525252;\n  --jh-popover: #ffffff;\n}\n\n[class^="jh-"], [class*=" jh-"] { font-family: var(--jh-font); font-kerning: normal; font-synthesis: none; }\n[class^="jh-"], [class*=" jh-"], [class^="jh-"] *, [class*=" jh-"] * { box-sizing: border-box; }\n.jh-button, .jh-switch, .jh-dialog__close { touch-action: manipulation; }\n.jh-button:focus-visible, .jh-switch:focus-visible, .jh-dialog__close:focus-visible { outline: 3px solid var(--jh-ring); outline-offset: 3px; }\n` + theme.slice(componentStart).replaceAll('var(--ring)', 'var(--jh-ring)').replaceAll('var(--popover)', 'var(--jh-popover)').replaceAll('var(--ring, #525252)', 'var(--jh-ring, #525252)');

const definitions = [
  ['button', 'Glass Button', 'Glass with liquid feedback and continuous corners.', ['button.tsx', 'smooth-shape.tsx', 'utils.ts'], ['class-variance-authority', 'figma-squircle', 'clsx', 'tailwind-merge']],
  ['slider', 'Glass Slider', 'A value control with a solid glass grip.', ['controls.tsx', 'utils.ts'], ['@radix-ui/react-slider', '@radix-ui/react-switch', 'clsx', 'tailwind-merge']],
  ['switch', 'Glass Switch', 'An accessible switch with a translucent lens.', ['controls.tsx', 'utils.ts'], ['@radix-ui/react-slider', '@radix-ui/react-switch', 'clsx', 'tailwind-merge']],
  ['dial', 'Tactile Dial', 'A tactile dial with a recessed seat and visible depth.', ['dial.tsx'], []],
  ['dialog', 'Soft Dialog', 'A light overlay with managed focus.', ['dialog.tsx', 'button.tsx', 'smooth-shape.tsx', 'utils.ts'], ['@radix-ui/react-dialog', 'lucide-react', 'class-variance-authority', 'figma-squircle', 'clsx', 'tailwind-merge']],
  ['smooth-shape', 'Smooth Corners', 'A responsive shape with continuous corners.', ['smooth-shape.tsx'], ['figma-squircle']],
  ['shader-surface', 'Glass Light', 'Monochromatic procedural light with a CSS fallback.', ['shader-surface.tsx'], ['@paper-design/shaders-react@0.0.82']],
  ['instrument', 'Instrument Bars', 'An SVG scale for values from zero to one hundred.', ['instrument.tsx'], []],
["bar-slider", "Bar Slider", "An interactive instrument scale with a solid glass handle.", ["bar-slider.tsx"], ["@radix-ui/react-slider"]],
["calendar", "Calendar", "A tactile calendar with accessible date selection.", ["calendar.tsx", "utils.ts"], ["react-day-picker@9.14.0", "clsx", "tailwind-merge"]],
["date-picker", "Date Picker", "A glass trigger and a focused calendar.", ["date-picker.tsx", "calendar.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["react-day-picker@9.14.0", "@radix-ui/react-popover", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["menu", "Glass Menu", "A light menu with keyboard navigation.", ["menu.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["@radix-ui/react-dropdown-menu", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["toast", "Soft Toast", "A controlled, accessible notification.", ["toast.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["@radix-ui/react-toast", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["gallery", "Gallery Slider", "A draggable gallery with native scroll snapping.", ["gallery.tsx"], ["lucide-react"]],
["input", "Soft Input", "A softly recessed native text field.", ["input.tsx", "utils.ts"], ["clsx", "tailwind-merge"]],
["search-input", "Search Field", "A recessed search field with a clear action.", ["search-input.tsx"], ["lucide-react"]],
["data-form", "Details Card", "A complete form with validation and save feedback.", ["data-form.tsx", "input.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
];
const items = [];
await mkdir(resolve(destination, 'r'), { recursive: true });
for (const [name, title, description, sources, dependencies] of definitions) {
  const files = [];
  for (const [index, filename] of sources.entries()) {
    let content = await readFile(resolve(root, 'assets/ui', filename), 'utf8');
    if (filename.endsWith('.tsx')) content = '"use client";\n' + (index === 0 ? 'import "./theme.css";\n' : '') + '\n' + content;
    files.push({ path: `assets/ui/${filename}`, type: 'registry:ui', target: `@components/jhosephe/${filename}`, content });
  }
  files.push({ path: 'assets/ui/theme.css', type: 'registry:file', target: '@components/jhosephe/theme.css', content: css });
  const item = { $schema: 'https://ui.shadcn.com/schema/registry-item.json', name, type: 'registry:ui', title, description, dependencies: ['@fontsource-variable/geist', ...dependencies], files };
  await writeFile(resolve(destination, 'r', `${name}.json`), JSON.stringify(item, null, 2) + '\n');
  items.push(item);
}
await writeFile(resolve(destination, 'registry.json'), JSON.stringify({ $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'jhosephe', homepage: 'https://github.com/jhosephebtc/jhosephe', items }, null, 2) + '\n');
console.log(`Registry pronto: ${items.length} componentes gerados dos arquivos de assets/ui.`);
