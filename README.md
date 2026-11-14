# Jhosephe UI

**A monochrome tactile interface system and 64-component registry built for React 19, TypeScript, CSS custom properties, Radix UI primitives, and shadcn/ui CLI compatibility.**

[![Live Showcase](https://img.shields.io/badge/Live%20App-jhosephe.vercel.app-111111?style=flat-square)](https://jhosephe.vercel.app)
[![Components](https://img.shields.io/badge/Components-64%20Registry%20Items-111111?style=flat-square)](https://jhosephe.vercel.app/components)
[![Tactile Lab](https://img.shields.io/badge/Tactile%20Lab-%2Flab-111111?style=flat-square)](https://jhosephe.vercel.app/lab)
[![Solar Observatory](https://img.shields.io/badge/Solar%20Observatory-%2Fsolar-111111?style=flat-square)](https://jhosephe.vercel.app/solar)
[![Star on GitHub](https://img.shields.io/github/stars/jhosephebtc/jhosephe?style=flat-square&label=Star%20on%20GitHub&color=111111)](https://github.com/jhosephebtc/jhosephe)
[![License: MIT](https://img.shields.io/badge/License-MIT-111111?style=flat-square)](LICENSE)

Explore the hosted experience at **[jhosephe.vercel.app](https://jhosephe.vercel.app)**:
- **[Component Library (`/components`)](https://jhosephe.vercel.app/components)** — Browse all 64 components with live **Light / Black**, **Transparency (`0–85%`)**, and **Blur (`0–32px`)** controls, props docs, and one-line shadcn CLI installs.
- **[Tactile Lab (`/lab`)](https://jhosephe.vercel.app/lab)** — Interactive studio for testing surface physics, confined OKLCH emitters, hardware optics, scrollbars, and multi-instrument layouts.
- **[Solar Observatory (`/solar`)](https://jhosephe.vercel.app/solar)** — Real-time solar and atmospheric telemetry stage demonstrating tactile astronomical gauges in production.

> **Enjoying Jhosephe UI?** If this design system helps your product or inspires your engineering, please consider leaving a **[Star on GitHub](https://github.com/jhosephebtc/jhosephe)** (`github.com/jhosephebtc/jhosephe`).

---

## Philosophy & Architecture

Jhosephe UI translates physical industrial controls, photographic optics, and calm editorial typography into production web software:

- **Dual Calibrated Achromatic Themes (`Light` & `Black / Dark`)**: Every structural token is 100% achromatic (`R = G = B`, `C = 0` in OKLCH) across **Light Porcelain** (`:root`, `#f8f8f8` canvas / `#ffffff` surfaces) and **Black Obsidian** (`:is([data-jh-theme="dark"], .dark)`, `#060606` canvas / `#0a0a0a`–`#0e0e0e` surfaces). Zero silver, chrome, or metallic surface textures.
- **Single-Family Typography (`Geist Variable`)**: Uses `@fontsource-variable/geist` (`--jh-font: 'Geist Variable', system-ui, sans-serif`) consistently across interface copy, data tables, numeric instrument readouts (`tabular-nums lining-nums`), and inline code blocks.
- **Continuous Squircle Geometry & Radix Accessibility**: Built on React 19, TypeScript, `@radix-ui/*` primitives, `figma-squircle` continuous corners (`SmoothShape`), and `@paper-design/shaders-react` monochrome ambient layers.
- **Non-Invasive `--jh-*` / `.jh-*` Isolation**: Registry stylesheets prefix custom tokens and classes cleanly so installed components coexist peacefully alongside existing Tailwind CSS or custom CSS architectures.

---

## Continuous Surface Transparency & Backdrop Blur

Rather than locking applications into rigid `Solid | Glass | Liquid` material presets, Jhosephe UI exposes a **continuous parametric surface system** driven by two CSS custom properties under `[data-jh-surface-custom="true"]`:

| Property | Range | Purpose |
| --- | --- | --- |
| `--jh-surface-alpha` | `1.00` (`0%` transparency) down to `0.15` (`85%` transparency) | Computed as `(100 - transparency) / 100`, tuning surface background translucency smoothly across Light Porcelain (`#ffffff`) and Black Obsidian (`#0a0a0a`). |
| `--jh-surface-blur` | `0px` to `32px` | Controls `backdrop-filter: blur(var(--jh-surface-blur))` across cards, panels, dialogs, menus, popovers, and instruments. |

### Strict Preservation Invariants

1. **Content & Elevation Never Fade or Blur**: Modulating `--jh-surface-alpha` (`0–85%`) and `--jh-surface-blur` (`0–32px`) adjusts **only** the component's background surface alpha and backdrop blur. Outer `box-shadow` elevation, typography (`color`), SVG icons, telemetry gauges, and image/gallery tiles remain at **100% sharpness and opacity**.
2. **Global Portal Synchronization**: Customizers apply `[data-jh-surface-custom="true"]`, `--jh-surface-alpha`, and `--jh-surface-blur` directly on `document.documentElement` so portaled overlays (`Dialog`, `Menu`, `ContextMenu`, `CommandPalette`, `Combobox`, `DatePicker`, `Toast`, `FinancialOrderModal`) match inline surfaces immediately.
3. **Neutral Ambient Stage & Pointer Physics**: Translucent surfaces sit cleanly over a neutral achromatic `<ShaderSurface />` backdrop, while liquid buttons (`.jh-button[data-liquid="true"]`) track `--jh-press-x` / `--jh-press-y` and compress with tactile depth (`translateY(1px) scale(.985)`) without abrupt `:active` face color jumps. `@media (prefers-reduced-transparency: reduce)` automatically restores high-contrast opaque surfaces.

---

## OKLCH Emissive Light & Tactile Depth

Chromatic color in Jhosephe UI is treated strictly as **physical light emission**, never as decorative surface paint:

- **Confined Low-Relief Wells & Channels**: Recessed channels (`.jh-dial__trough`, `.jh-lunar-ephemeris__trough`, `.jh-instrument__well`, `.jh-audio-meter__segments`, milled `::after` indicators, and hardware pinholes) sit physically beneath floating glass thumbs and sculpted faces with strict containment (`overflow: hidden` and SVG `<mask>` / `<clipPath>`).
- **Standby vs. Active Illumination**: Controls such as `Dial`, `DetentDial`, `Slider`, `BarSlider`, `TactileLever`, `TactileKey`, `TactileKeypad`, `TactileConsole`, `InstrumentBars`, `AudioMeter`, and `LunarEphemeris` settle into a quiet resting standby state when idle and shift into saturated OKLCH emission on pointer press, scrub, drag, or keyboard activation.
- **Hardware & Photographic Optics**: Sculpted multi-shape decks (`TactileKey`, `TactileKeypad`, `TactileConsole`), knurled anodized exposure dials (`CameraWheel`, `CameraDial`), medium-format inspection wells (`FilmstripGallery`), and Swiss typographic EXIF grids (`ImageInspector`) share identical physical elevation across Light and Black Obsidian themes.

---

## Unified Scroll Architecture

All scrollable showcases share the exact same two-layer physical anatomy, `.jh-scroll-frame > .jh-scroll-area`:

- **Single Container Elevation (`SimpleScroll`, `AccordionScroll`, `VerticalGallery`, `ScrollArea`)**: Outer elevation shadow, border hairline, corner radius, and custom surface transparency/blur live strictly on `.jh-scroll-frame`. The inner `.jh-scroll-area` remains completely flat and transparent—eliminating nested card double-elevation.
- **Thin Arrowless Scrollbar & Progressive Reveal**: Native OS scrollbar arrows are hidden (`::-webkit-scrollbar-button { display: none }`), pairing a slim rounded thumb with symmetric spacing and intersection-driven progressive edge reveal (`useScrollItemReveal`).
- **Vertical Gallery (`VerticalGallery`)**: Renders a `4 × 12` contact-sheet grid inside `.jh-scroll-frame > .jh-scroll-area` with an inline aspect-ratio switcher (`1:1 | 3:4 | 4:5 | 9:16 | 16:9`) and raised, non-debossed photographic tiles.

---

## Dual-Theme Pipeline

Black Obsidian (`:is([data-jh-theme="dark"], .dark)`) overrides inside [`assets/ui/theme.css`](assets/ui/theme.css) are generated deterministically rather than hand-patched token by token:

```sh
node scripts/generate-dark-theme.mjs
```

Running the generator recomputes calibrated obsidian canvases (`#060606`), card/modal surfaces (`#0a0a0a`), button/thumb gradients (`#0e0e0e → #0a0a0a`), recessed cavities (`#060606`/`#070707`), subtle top rim lights (`rgb(255 255 255 / .010)`–`.022`), and dark scrollbars directly inside the `/* === JH_BLACK_THEME_START === */` block.

---

## Complete 64-Component Catalog

Every component below is published as an individual registry entry (`https://jhosephe.vercel.app/r/<id>.json`) verified across Light and Black Obsidian themes.

### Surfaces & Scroll Containers (7)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `shader-surface` | Glass Light | Monochrome Paper Shader backdrop | `npx shadcn@latest add https://jhosephe.vercel.app/r/shader-surface.json` |
| `smooth-shape` | Smooth Corners | Continuous Figma squircle container | `npx shadcn@latest add https://jhosephe.vercel.app/r/smooth-shape.json` |
| `scroll-area` | Vertical Scroll | Multi-column scrollable option panel | `npx shadcn@latest add https://jhosephe.vercel.app/r/scroll-area.json` |
| `simple-scroll` | Simple Scroll | Single-column feed with gradual edge reveal | `npx shadcn@latest add https://jhosephe.vercel.app/r/simple-scroll.json` |
| `accordion-scroll` | Accordion Scroll | Scrollable disclosure list without nested elevation | `npx shadcn@latest add https://jhosephe.vercel.app/r/accordion-scroll.json` |
| `vertical-gallery` | Vertical Gallery | `4 × 12` contact-sheet grid with `1:1–16:9` aspect switcher | `npx shadcn@latest add https://jhosephe.vercel.app/r/vertical-gallery.json` |
| `image-frame` | Image Frame | Proportion-preserving quiet photography frame | `npx shadcn@latest add https://jhosephe.vercel.app/r/image-frame.json` |

### Controls & Tactile Inputs (10)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `button` | Glass Button | Pointer-reactive liquid tactile button + loading state | `npx shadcn@latest add https://jhosephe.vercel.app/r/button.json` |
| `slider` | Glass Slider | Rigid floating glass grip over OKLCH well | `npx shadcn@latest add https://jhosephe.vercel.app/r/slider.json` |
| `bar-slider` | Bar Slider | Direct drag bar with numeric tabular readout | `npx shadcn@latest add https://jhosephe.vercel.app/r/bar-slider.json` |
| `dial` | Tactile Dial | Precision rotary dial (`classic`, `arc`, `vernier`, `monolith`) | `npx shadcn@latest add https://jhosephe.vercel.app/r/dial.json` |
| `detent-dial` | Detent Dial | Stepped rotary dial with deliberate tactile stops | `npx shadcn@latest add https://jhosephe.vercel.app/r/detent-dial.json` |
| `tactile-lever` | Tactile Lever | Vertical mechanical throw with rest detent | `npx shadcn@latest add https://jhosephe.vercel.app/r/tactile-lever.json` |
| `spectrum-control` | Spectrum Control | Interactive hue, saturation, and lightness tuner | `npx shadcn@latest add https://jhosephe.vercel.app/r/spectrum-control.json` |
| `oklch-palette` | OKLCH Palette | Perceptually uniform OKLCH color grid picker | `npx shadcn@latest add https://jhosephe.vercel.app/r/oklch-palette.json` |
| `input` | Soft Input | Recessed text field with quiet hairline rim | `npx shadcn@latest add https://jhosephe.vercel.app/r/input.json` |
| `search-input` | Search Field | Recessed search input with live clear action | `npx shadcn@latest add https://jhosephe.vercel.app/r/search-input.json` |

### Toggles, Choice & Pickers (7)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `switch` | Glass Switch | Low-profile glass rocker with clear active state | `npx shadcn@latest add https://jhosephe.vercel.app/r/switch.json` |
| `radio-group` | Radio Group | Tactile single-select choice stack with descriptions | `npx shadcn@latest add https://jhosephe.vercel.app/r/radio-group.json` |
| `combobox` | Combobox | Filterable Radix popover selector | `npx shadcn@latest add https://jhosephe.vercel.app/r/combobox.json` |
| `calendar` | Calendar | Minimal monochrome month calendar (`react-day-picker`) | `npx shadcn@latest add https://jhosephe.vercel.app/r/calendar.json` |
| `date-picker` | Date Picker | Popover-coupled date selection trigger | `npx shadcn@latest add https://jhosephe.vercel.app/r/date-picker.json` |
| `date-time-picker` | Date and Time Picker | Combined date, hour/minute, and confirmation flow | `npx shadcn@latest add https://jhosephe.vercel.app/r/date-time-picker.json` |
| `file-transfer` | File Transfer | Upload and download progress queue card | `npx shadcn@latest add https://jhosephe.vercel.app/r/file-transfer.json` |

### Menus, Dialogs & Overlays (6)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `dialog` | Soft Dialog | Translucent modal surface with focus trapping | `npx shadcn@latest add https://jhosephe.vercel.app/r/dialog.json` |
| `menu` | Glass Menu | Radix dropdown menu with blurred portal surface | `npx shadcn@latest add https://jhosephe.vercel.app/r/menu.json` |
| `context-menu` | Action Menu | Pointer-anchored contextual menu trigger | `npx shadcn@latest add https://jhosephe.vercel.app/r/context-menu.json` |
| `command-palette` | Command Palette | Keyboard-first modal command runner (`Cmd/Ctrl + K`) | `npx shadcn@latest add https://jhosephe.vercel.app/r/command-palette.json` |
| `data-form` | Details Card | Structured editorial input surface | `npx shadcn@latest add https://jhosephe.vercel.app/r/data-form.json` |
| `toast` | Soft Toast | Quiet transient confirmation banner | `npx shadcn@latest add https://jhosephe.vercel.app/r/toast.json` |

### Navigation (6)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `tabs` | Tabs | Single-row accessible view switcher without shift | `npx shadcn@latest add https://jhosephe.vercel.app/r/tabs.json` |
| `segmented-control` | Segmented Control | Recessed pill-track mode selector | `npx shadcn@latest add https://jhosephe.vercel.app/r/segmented-control.json` |
| `accordion` | Accordion | Quiet stacked disclosure panels | `npx shadcn@latest add https://jhosephe.vercel.app/r/accordion.json` |
| `step-navigation` | Step Navigation | Multi-step workflow rail and progress track | `npx shadcn@latest add https://jhosephe.vercel.app/r/step-navigation.json` |
| `gallery` | Gallery Slider | Horizontal touch/button card carousel | `npx shadcn@latest add https://jhosephe.vercel.app/r/gallery.json` |
| `finance-navigation` | Finance Navigation | Monochrome sidebar & workspace command shell | `npx shadcn@latest add https://jhosephe.vercel.app/r/finance-navigation.json` |

### Data Display & Telemetry (5)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `data-table` | Data Table | Sortable semantic table with mobile card fallback | `npx shadcn@latest add https://jhosephe.vercel.app/r/data-table.json` |
| `metric-card` | Metric Card | Tabular numeric metric paired with inline spark well | `npx shadcn@latest add https://jhosephe.vercel.app/r/metric-card.json` |
| `progress-bar` | Progress Bar | Confined linear progress channel | `npx shadcn@latest add https://jhosephe.vercel.app/r/progress-bar.json` |
| `instrument` | Instrument Bars | Vertical SVG level readout inside recessed wells | `npx shadcn@latest add https://jhosephe.vercel.app/r/instrument.json` |
| `audio-meter` | Audio Meter | Segmented decibel grid meter with OKLCH peak state | `npx shadcn@latest add https://jhosephe.vercel.app/r/audio-meter.json` |

### Financial & Market (4)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `financial-chart` | Financial Chart | Interactive monochrome price history & crosshair | `npx shadcn@latest add https://jhosephe.vercel.app/r/financial-chart.json` |
| `market-picker` | Market Picker | Searchable equity/asset selector overlay | `npx shadcn@latest add https://jhosephe.vercel.app/r/market-picker.json` |
| `currency-picker` | Currency Picker | Filterable FX currency switcher | `npx shadcn@latest add https://jhosephe.vercel.app/r/currency-picker.json` |
| `financial-order-modal` | Financial Order Modal | Considered order entry & review dialog | `npx shadcn@latest add https://jhosephe.vercel.app/r/financial-order-modal.json` |

### Aviation & Ephemeris (8)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `compass` | Compass Instrument | Interactive 360-degree tactile heading rose | `npx shadcn@latest add https://jhosephe.vercel.app/r/compass.json` |
| `attitude-indicator` | Attitude Indicator | Pitch and roll artificial horizon instrument | `npx shadcn@latest add https://jhosephe.vercel.app/r/attitude-indicator.json` |
| `navigation-instrument` | Navigation Instrument | Marine/aviation course, heading, and telemetry cluster | `npx shadcn@latest add https://jhosephe.vercel.app/r/navigation-instrument.json` |
| `race-telemetry` | Race Telemetry | Lap delta, gear, and throttle telemetry deck | `npx shadcn@latest add https://jhosephe.vercel.app/r/race-telemetry.json` |
| `astronomy-instrument` | Solar Ephemeris | Real-time solar altitude, azimuth, and twilight arc | `npx shadcn@latest add https://jhosephe.vercel.app/r/astronomy-instrument.json` |
| `lunar-ephemeris` | Lunar Ephemeris | Clean terminator moon sphere & scrubbable orbital cycle | `npx shadcn@latest add https://jhosephe.vercel.app/r/lunar-ephemeris.json` |
| `ephemeris-picker` | Ephemeris Picker | Timestamp and geographic coordinate selector (`tz-lookup`) | `npx shadcn@latest add https://jhosephe.vercel.app/r/ephemeris-picker.json` |
| `astrology-wheel` | Astrology Wheel | Interactive celestial body chart wheel | `npx shadcn@latest add https://jhosephe.vercel.app/r/astrology-wheel.json` |

### Weather & Celestial (4)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `weather-instrument` | Weather Instrument | Compact barometer, dew point, and sky conditions | `npx shadcn@latest add https://jhosephe.vercel.app/r/weather-instrument.json` |
| `weather-conditions` | Weather Conditions | Multi-metric atmospheric and forecast card | `npx shadcn@latest add https://jhosephe.vercel.app/r/weather-conditions.json` |
| `wind-instrument` | Wind Vector | 360-degree wind compass, gust vector, and Beaufort scale | `npx shadcn@latest add https://jhosephe.vercel.app/r/wind-instrument.json` |
| `tide-instrument` | Tide Curve | 24-hour harmonic tidal curve with lunar phase coupling | `npx shadcn@latest add https://jhosephe.vercel.app/r/tide-instrument.json` |

### Hardware & Photography Optics (7)

| ID | Name | Role | Install CLI |
| --- | --- | --- | --- |
| `tactile-key` | Tactile Key | Mechanical keycap (`pad`, `dish`, `circle`, `pill`) with pinhole LED | `npx shadcn@latest add https://jhosephe.vercel.app/r/tactile-key.json` |
| `tactile-keypad` | Tactile Keypad | Multi-key sequencer, keyboard, and command matrix | `npx shadcn@latest add https://jhosephe.vercel.app/r/tactile-keypad.json` |
| `tactile-console` | Tactile Console | Perforated speaker grille, OLED strip, 4 encoders, and 8 steps | `npx shadcn@latest add https://jhosephe.vercel.app/r/tactile-console.json` |
| `camera-wheel` | Camera Wheel | Anodized knurled barrel with third-stop EV scale (`⅓`, `⅔`) | `npx shadcn@latest add https://jhosephe.vercel.app/r/camera-wheel.json` |
| `camera-dial` | Camera Dial | GF670-style turret collar with sunken ISO window & film wheel | `npx shadcn@latest add https://jhosephe.vercel.app/r/camera-dial.json` |
| `filmstrip-gallery` | 120 Filmstrip Gallery | Recessed viewing loupe well paired with draggable 120 ribbon | `npx shadcn@latest add https://jhosephe.vercel.app/r/filmstrip-gallery.json` |
| `image-inspector` | Image Inspector | Swiss tabular EXIF sheet and local file verifier | `npx shadcn@latest add https://jhosephe.vercel.app/r/image-inspector.json` |

---

## Direct Installation via shadcn CLI

Install any component directly from the hosted public registry without cloning this repository:

```sh
npx shadcn@latest add https://jhosephe.vercel.app/r/button.json
```

Replace `button.json` with any of the 64 component IDs listed above (or inspect the full catalog manifest at [`https://jhosephe.vercel.app/registry.json`](https://jhosephe.vercel.app/registry.json)). Each registry payload installs:
- Self-contained React 19 + TypeScript component source under your configured `components.json` aliases.
- Required npm packages (such as `@fontsource-variable/geist`, `@radix-ui/*`, `lucide-react`, `figma-squircle`, `suncalc`, or `@paper-design/shaders-react`).
- Scoped `--jh-*` CSS tokens and `.jh-*` component classes without injecting global CSS resets into `body`.

---

## Using `jhosephe` as an AI Agent Skill

Jhosephe UI ships with an installable agent skill (`SKILL.md`, `agents/openai.yaml`, `references/*.md`, `docs/design-system.md`, and `assets/ui/`) so coding agents follow the dual-theme, continuous transparency/blur, unified scrollbar, and tactile physics contracts automatically.

Install the skill bundle into a fresh target directory (for example, your local Codex/Agent skills folder):

```sh
node scripts/install-skill.mjs --dest <path-to-new-skill-folder>/jhosephe
```

Once installed, invoke `$jhosephe` or reference [`SKILL.md`](SKILL.md) when designing or reviewing React/shadcn components. Detailed domain specs live in:
- [`docs/design-system.md`](docs/design-system.md) — Canonical specification for tokens, continuous surfaces, scrollbars, and dark calibration.
- [`references/design-language.md`](references/design-language.md) — Dual monochrome grammar and copy conventions (`en-US`, sentence case).
- [`references/materials.md`](references/materials.md) — Continuous `--jh-surface-alpha` / `--jh-surface-blur`, portal propagation, OKLCH wells, and scroll frames.
- [`references/react-shadcn.md`](references/react-shadcn.md) — `--jh-*` isolation, portal contracts, and public registry authoring.

---

## Local Development, Registry Build & Verification

Requires **Node.js `>=22.12`**.

```sh
# 1. Install dependencies
npm ci

# 2. Start local showcase & lab (automatically rebuilds registry via predev)
npm run dev

# 3. Regenerate deterministic Black / Dark Obsidian overrides in assets/ui/theme.css
node scripts/generate-dark-theme.mjs

# 4. Build the 64 shadcn/ui registry JSON payloads into examples/lab/public/r/
npm run registry:build

# 5. Run skill validation, Vitest unit tests, TypeScript check, and production Vite build
npm run check

# 6. Run Playwright browser integration & visual tests
npm run test:browser
```

---

## License

Released under the [MIT License](LICENSE).
