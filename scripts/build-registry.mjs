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
  ['oklch-palette', 'OKLCH Palette', 'A contextual, keyboard-accessible color palette arranged as a honeycomb.', ['oklch-palette.tsx'], ['@radix-ui/react-popover', 'lucide-react']],
["bar-slider", "Bar Slider", "An interactive instrument scale with a solid glass handle.", ["bar-slider.tsx"], ["@radix-ui/react-slider"]],
["calendar", "Calendar", "A tactile calendar with accessible date selection.", ["calendar.tsx", "utils.ts"], ["react-day-picker@9.14.0", "clsx", "tailwind-merge"]],
["date-picker", "Date Picker", "A glass trigger and a focused calendar.", ["date-picker.tsx", "calendar.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["react-day-picker@9.14.0", "@radix-ui/react-popover", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["menu", "Glass Menu", "A light menu with keyboard navigation.", ["menu.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["@radix-ui/react-dropdown-menu", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["toast", "Soft Toast", "A controlled, accessible notification.", ["toast.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["@radix-ui/react-toast", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["gallery", "Gallery Slider", "A draggable gallery with native scroll snapping.", ["gallery.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["input", "Soft Input", "A softly recessed native text field.", ["input.tsx", "utils.ts"], ["clsx", "tailwind-merge"]],
["search-input", "Search Field", "A recessed search field with a clear action.", ["search-input.tsx"], ["lucide-react"]],
["data-form", "Details Card", "A complete form with validation and save feedback.", ["data-form.tsx", "input.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["radio-group", "Radio Group", "Accessible single-choice options with a soft selected face.", ["radio-group.tsx"], []],
["segmented-control", "Segmented Control", "Compact, keyboard-accessible navigation between views.", ["segmented-control.tsx"], []],
["scroll-area", "Vertical Scroll", "A keyboard-accessible vertical scrolling region.", ["scroll-area.tsx", "utils.ts"], ["clsx", "tailwind-merge"]],
["context-menu", "Action Menu", "A glass overflow menu for contextual actions.", ["context-menu.tsx", "menu.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["@radix-ui/react-dropdown-menu", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["tactile-key", "Tactile Key", "A glass key with a definite press response.", ["tactile-key.tsx", "utils.ts"], ["clsx", "tailwind-merge"]],
["compass", "Compass Instrument", "A monochrome compass with heading controls.", ["compass.tsx", "controls.tsx", "utils.ts"], ["@radix-ui/react-slider", "@radix-ui/react-switch", "clsx", "tailwind-merge"]],
["spectrum-control", "Spectrum Control", "Interactive hue, saturation, and lightness controls with OKLCH, RGB, HSL, and color libraries.", ["spectrum-control.tsx", "controls.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-slider", "@radix-ui/react-switch", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["step-navigation", "Step Navigation", "A tactile navigation path through a multi-step task.", ["step-navigation.tsx"], []],
["date-time-picker", "Date and Time Picker", "A rich calendar, time slot, and confirmation picker.", ["date-time-picker.tsx", "calendar.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["react-day-picker@9.14.0", "@radix-ui/react-popover", "lucide-react", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["audio-meter", "Audio Meter", "A rhythmic SVG meter with optional microphone input.", ["audio-meter.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["weather-instrument", "Weather Instrument", "A monochrome wind rose and weather readouts.", ["weather-instrument.tsx"], []],
["attitude-indicator", "Attitude Indicator", "A monochrome pitch and roll instrument.", ["attitude-indicator.tsx"], []],
["navigation-instrument", "Navigation Instrument", "Heading, speed, and marine or aviation telemetry.", ["navigation-instrument.tsx"], []],
["progress-bar", "Progress Bar", "Determinate and indeterminate tactile progress.", ["progress-bar.tsx"], []],
["file-transfer", "File Transfer", "Local file preparation with progress and sample download.", ["file-transfer.tsx", "progress-bar.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["image-frame", "Image Frame", "A responsive image frame with nested corners.", ["image-frame.tsx"], []],
["accordion", "Accordion", "A keyboard-operable disclosure group.", ["accordion.tsx", "utils.ts", "weather-ephemeris.ts"], ["lucide-react", "clsx", "tailwind-merge"]],
["detent-dial", "Detent Dial", "A tactile rotary selector with discrete stops.", ["detent-dial.tsx", "dial.tsx"], []],
["tactile-lever", "Tactile Lever", "A vertical glass lever with measured throw.", ["tactile-lever.tsx"], ["@radix-ui/react-slider"]],
["financial-chart", "Financial Chart", "An interactive line and bar market chart.", ["financial-chart.tsx"], []],
["market-picker", "Market Picker", "Search stocks, funds, and crypto demo data.", ["market-picker.tsx"], []],
["currency-picker", "Currency Picker", "A searchable currency popover with demo rates.", ["currency-picker.tsx"], []],
["financial-order-modal", "Financial Order Modal", "A multi-step brokerage order review dialog.", ["financial-order-modal.tsx", "currency-picker.tsx", "picker-panel.tsx", "scroll-area.tsx", "shader-surface.tsx", "utils.ts"], ["@paper-design/shaders-react@0.0.82", "clsx", "tailwind-merge"]],
["astronomy-instrument", "Solar Ephemeris", "A live local-time solar position instrument.", ["astronomy-instrument.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts", "weather-ephemeris.ts"], ["class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["ephemeris-picker", "Ephemeris Picker", "Select an observation time, place, and body.", ["ephemeris-picker.tsx", "picker-panel.tsx", "scroll-area.tsx", "calendar.tsx", "shader-surface.tsx", "weather-ephemeris.ts", "utils.ts"], ["lucide-react", "react-day-picker@9.14.0", "@paper-design/shaders-react@0.0.82", "clsx", "tailwind-merge"]],
["astrology-wheel", "Astrology Wheel", "An interactive zodiac and planet chart.", ["astrology-wheel.tsx", "weather-ephemeris.ts"], []],
["race-telemetry", "Race Telemetry", "A tactile motorsport telemetry dashboard.", ["race-telemetry.tsx", "button.tsx", "smooth-shape.tsx", "utils.ts"], ["class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["finance-navigation", "Finance Navigation", "A responsive side menu and header navigation.", ["finance-navigation.tsx"], []],
["weather-conditions", "Weather Conditions", "Ambient temperature, comfort metrics, and hourly/daily forecast.", ["weather-conditions.tsx", "segmented-control.tsx", "weather-ephemeris.ts"], []],
["wind-instrument", "Wind Vector", "360-degree wind direction compass and Beaufort scale.", ["wind-instrument.tsx", "segmented-control.tsx", "controls.tsx", "weather-ephemeris.ts", "utils.ts"], ["@radix-ui/react-slider", "@radix-ui/react-switch", "clsx", "tailwind-merge"]],
["tide-instrument", "Tide Curve", "24-hour harmonic tidal wave and lunar coupling readouts.", ["tide-instrument.tsx", "segmented-control.tsx", "controls.tsx", "button.tsx", "smooth-shape.tsx", "weather-ephemeris.ts", "utils.ts"], ["@radix-ui/react-slider", "@radix-ui/react-switch", "class-variance-authority", "figma-squircle", "clsx", "tailwind-merge"]],
["lunar-ephemeris", "Lunar Ephemeris", "Moon phase terminator disc, illumination, and orbital cycle.", ["lunar-ephemeris.tsx", "controls.tsx", "weather-ephemeris.ts", "utils.ts"], ["@radix-ui/react-slider", "@radix-ui/react-switch", "clsx", "tailwind-merge"]],
["combobox", "Combobox", "Searchable dropdown selector backed by the shared popover surface.", ["combobox.tsx", "picker-panel.tsx", "scroll-area.tsx", "weather-ephemeris.ts", "utils.ts"], ["lucide-react", "clsx", "tailwind-merge"]],
["tabs", "Tabs", "Single-row accessible tab bar with roving keyboard focus.", ["tabs.tsx", "shader-surface.tsx", "weather-ephemeris.ts", "utils.ts"], ["@paper-design/shaders-react@0.0.82", "clsx", "tailwind-merge"]],
["data-table", "Data Table", "Sortable semantic table with sticky header and mobile card layout.", ["data-table.tsx", "shader-surface.tsx", "weather-ephemeris.ts", "utils.ts"], ["lucide-react", "@paper-design/shaders-react@0.0.82", "clsx", "tailwind-merge"]],
["command-palette", "Command Palette", "Keyboard-first modal action runner with search and grouping.", ["command-palette.tsx", "input.tsx", "shader-surface.tsx", "weather-ephemeris.ts", "utils.ts"], ["lucide-react", "@paper-design/shaders-react@0.0.82", "clsx", "tailwind-merge"]],
["metric-card", "Metric Card", "Monochrome KPI card with interactive sparkline inspection.", ["metric-card.tsx", "shader-surface.tsx", "weather-ephemeris.ts", "utils.ts"], ["@paper-design/shaders-react@0.0.82", "clsx", "tailwind-merge"]],
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
