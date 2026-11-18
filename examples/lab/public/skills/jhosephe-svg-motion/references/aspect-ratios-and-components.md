# Aspect Ratios, Architectural Grids & Component Catalog

## 1. Aspect Ratios (1:1 Native Authoring Coordinates)

Author every SVG directly at target pixel resolution so CSS GPU `drop-shadow` / `blur`, font kerning, and hairline `1px` structural grids render cleanly without scaling artifacts.

| Ratio | Native `viewBox` | Export MP4 Resolution | Architectural Composition Layout |
| --- | --- | --- | --- |
| `3:2` | `0 0 1620 1080` | `1620×1080` | **12-column Swiss grid** (`72px` L/R margin, `1476px` span, `24px` gutter, `101px` col): `4+8` (`548` / `572`), `5+7` (`673` / `697`), `6+6`, or top header + full `1476px` instrument bay. Ideal for X/Twitter media cards & threads. |
| `16:9` | `0 0 1920 1080` | `1920×1080` | **Widescreen showcase**: Left editorial column (`x: 96..680`) + expansive hardware stage on right (`cx: 1320, cy: 540`). |
| `1:1` | `0 0 1080 1080` | `1080×1080` | **Square feed card**: Header band (`y: 64..290`), large centered instrument (`cx: 540, cy: 620`), bottom telemetry footer (`y: 970`). |
| `4:5` | `0 0 1080 1350` | `1080×1350` | **Portrait feed stack**: Top headline + brand lockup (`y: 80..410`), centerpiece dial/meter (`cx: 540, cy: 810`), synced metrics strip below (`y: 1190`). |
| `9:16` | `0 0 1080 1920` | `1080×1920` | **Reels / Shorts / Stories**: Generous safe top/bottom insets (`y: 180..1680`), stacked headline -> hardware instrument -> readout cards. |

### `3:2` (`1620×1080`) Column Math Cheat Sheet
- `col(c) = 72 + (c - 1) * 125` (`c = 1..12`), each column `101px` wide, `24px` gutter.
- `Cols 1–4` = `x: 72, w: 476` (`-> 548`) | `Cols 5–12` = `x: 572, w: 976` (`-> 1548`)
- `Cols 1–5` = `x: 72, w: 601` (`-> 673`) | `Cols 6–12` = `x: 697, w: 851` (`-> 1548`)
- `4 equal cards` (`3 cols` each) = `72..423`, `447..798`, `822..1173`, `1197..1548` (`w = 351px`).
- Footer bar (`y = 982..1016`) sits below horizontal baseline divider (`y = 960`), guaranteeing `>= icon height` clear space around horizontal brand lockups.

### Diagramming Discipline & Material Finish
- **Minimal poster density**: Keep social layouts crisp and breathable (`1 eyebrow`, `1 serif/display headline`, at most `1 short subline or hero metric`, `1 sculptural hardware centerpiece`, and `1 clean footer`). Align via invisible Swiss column axes instead of drawing dense tables, small captions, or boxed metric cards.
- **Archival paper grain + 3D elevation**: Add subtle `<feTurbulence type="fractalNoise">` grain + low-opacity organic fibers strictly to the background paper rect (`#EDEBE6`, `#06090A`, or `#0E5661`), and pair foreground instruments with multi-pass directional CSS `drop-shadow(...)` contact + ambient cast shadows.
- **Confined light**: Headlines and brand marks stay crisp and unblurred; only hardware emitters (LEDs, active arcs, active ticks, active bars, live curve beacons) emit glow.
- Escape all XML ampersands as `&amp;`.

---

## 2. Jhosephe UI Hardware Blueprints (`assets/ui/`)

Always read both `assets/ui/<component>.tsx` and `assets/ui/theme.css` before drawing geometry.

### Tactile Controls
- **`Dial`** (`assets/ui/dial.tsx`) — Variants: `'classic' | 'arc' | 'vernier' | 'monolith'`. `40` radial graduations from `-135°` to `+135°` (`270°` total sweep), recessed channel trough, sculpted clay/porcelain/obsidian dome (`r ≈ 176` at desktop hero scale), emissive rotary indicator pip. Supports high-relief center emblem or brand medallion inside the knob face.
- **`DetentDial`** (`assets/ui/detent-dial.tsx`) — Discrete rotary stops (`01..04`) paired with synchronized mode cards connected via orthogonal PCB dashed trace lines to the dial bezel.
- **`Slider` / `BarSlider`** (`assets/ui/controls.tsx`, `assets/ui/bar-slider.tsx`) — Linear recessed channel with rigid glass/obsidian thumb or segmented emissive LED bar array.
- **`TactileKey` / `TactileKeypad` / `TactileConsole`** (`assets/ui/tactile-key.tsx`, `tactile-keypad.tsx`, `tactile-console.tsx`) — Recessed mechanical keycaps, pinhole LEDs, speaker matrix, OLED matrix, and step-sequencer rows.
- **`TactileLever`** (`assets/ui/tactile-lever.tsx`) — Vertical travel slot toggle with resting vs. active LED emitter.
- **`CameraWheel` / `CameraDial`** (`assets/ui/camera-wheel.tsx`, `camera-dial.tsx`) — Knurled exposure/mode wheels, datum pip, and vernier ticks.
- **`SpectrumControl` / `OklchPalette`** (`assets/ui/spectrum-control.tsx`, `oklch-palette.tsx`) — Calibrated OKLCH honeycomb/spectrum light selectors.

### Instruments & Telemetry
- **`InstrumentBars`** (`assets/ui/instrument.tsx`) — **33 vertical precision bars** inside a beveled tray with top hairline ruler brackets (`.jh-instrument__line`), tall major bar every 4th index (`i % 4 === 0`, ideal anchor needles at `i = 4, 12, 20, 28` for equal `8`-step intervals), active gradient + specular inner light rib, and resting muted bars.
- **`AudioMeter`** (`assets/ui/audio-meter.tsx`) — Multi-column **12-row rounded LED matrix** (`rx=4`) inside a dark recessed channel (`low -> mid -> hot -> peak` emission ramp). Ideal for multi-source/network channel telemetry (`X`, `Reddit`, `YT`, `TikTok`, `IG`, `News`).
- **`LunarEphemeris`** (`assets/ui/lunar-ephemeris.tsx`) — **28 synodic/cycle radial ticks**, recessed ring trough, machined bevel, directional sunlight incidence ray + photon node, clipped lit/night spherical gradient dome, orbital streak pip, and `2×3` bottom readout tiles.
- **`AstronomyInstrument`** (`assets/ui/astronomy-instrument.tsx`) — Quadratic celestial horizon curve (`M ... Q ...`), 25 baseline graduations, glowing telemetry spline + altitude drop-line + solar halo, plus 5-column KPI readout row and summary bar.
- **`Compass` / `AttitudeIndicator` / `NavigationInstrument` / `RaceTelemetry`** — Rotating azimuth rings, artificial horizon, tachometer/sector readouts.

### Data & Finance
- **`FinancialChart` / `MetricCard` / `ProgressBar`** (`assets/ui/financial-chart.tsx`, `metric-card.tsx`, `progress-bar.tsx`) — Header identity badge + live tabular metric + delta pill, right-gutter Y-axis labels clear of bars/curves, translucent hourly histogram underlay + glowing smoothed spline, peak dashed crosshair & dual-ring beacon, and 4 bottom metric tiles.
