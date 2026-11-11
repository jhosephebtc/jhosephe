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
const css = `@import "@fontsource-variable/geist";\n\n:root {\n${tokens}\n  --jh-ring: #525252;\n  --jh-popover: #ffffff;\n}\n\n[class^="jh-"], [class*=" jh-"] { font-family: var(--jh-font); font-kerning: normal; font-synthesis: none; }\n[class^="jh-"], [class*=" jh-"], [class^="jh-"] *, [class*=" jh-"] * { box-sizing: border-box; }\n.jh-button, .jh-switch, .jh-dialog__close { touch-action: manipulation; }\n.jh-button:focus-visible, .jh-switch:focus-visible, .jh-dialog__close:focus-visible { outline: 3px solid var(--jh-ring); outline-offset: 3px; }\n` + theme.slice(componentStart).replaceAll('var(--ring)', 'var(--jh-ring)').replaceAll('var(--popover)', 'var(--jh-popover)');

const definitions = [
  ['button', 'Glass Button', 'Vidro com resposta liquid e cantos contínuos.', ['button.tsx', 'smooth-shape.tsx', 'utils.ts'], ['class-variance-authority', 'figma-squircle', 'clsx', 'tailwind-merge']],
  ['slider', 'Glass Slider', 'Controle de valor com puxador em lente de vidro.', ['controls.tsx', 'utils.ts'], ['@radix-ui/react-slider', '@radix-ui/react-switch', 'clsx', 'tailwind-merge']],
  ['switch', 'Glass Switch', 'Interruptor acessível com lente translúcida.', ['controls.tsx', 'utils.ts'], ['@radix-ui/react-slider', '@radix-ui/react-switch', 'clsx', 'tailwind-merge']],
  ['dial', 'Tactile Dial', 'Controle de intensidade com volume e luz suave.', ['dial.tsx'], []],
  ['dialog', 'Soft Dialog', 'Sobreposição clara com gerenciamento de foco.', ['dialog.tsx', 'button.tsx', 'smooth-shape.tsx', 'utils.ts'], ['@radix-ui/react-dialog', 'lucide-react', 'class-variance-authority', 'figma-squircle', 'clsx', 'tailwind-merge']],
  ['smooth-shape', 'Smooth Corners', 'Forma responsiva com cantos contínuos.', ['smooth-shape.tsx'], ['figma-squircle']],
  ['shader-surface', 'Glass Light', 'Luz procedural monocromática com fallback CSS.', ['shader-surface.tsx'], ['@paper-design/shaders-react@0.0.82']],
  ['instrument', 'Instrument Bars', 'Escala visual em SVG para valores de zero a cem.', ['instrument.tsx'], []],
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
