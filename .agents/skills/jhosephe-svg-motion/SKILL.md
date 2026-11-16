---
name: jhosephe-svg-motion
description: >-
  Create brand-aligned architectural SVG drafts, animated SVGs, 60fps MP4 videos, and X/social thread posts built from Jhosephe UI tactile components.
  Use when the user asks to design social posts, animated SVGs, motion graphics, or MP4 showcases using tactile controls/instruments and brand assets.
  Supports draft-first static SVG review before animating, strict 12-column Swiss grids, Geist Serif/Sans/Mono typography, and X/Twitter <= 0.5s opening hook timing.
---

# Jhosephe SVG Motion, Social Posts & Video Generator

Generates crisp, hardware-realistic **static SVG drafts**, **animated SVGs**, **H.264 60fps MP4 videos**, and **structured social thread breakdowns** combining **Jhosephe UI** tactile components (`assets/ui/`) with any target brand identity.

## Phase 1: Mandatory Intake & Workflow Mode

Before writing any SVG, HTML, or render script, confirm:

1. **Delivery Mode (Draft-First vs. Direct Motion)**
   - **Draft-first workflow (default when exploring a brand)**: Author and visually verify **static SVG drafts** (`--preview`) and share them with the user before adding `@keyframes` / SMIL motion or encoding `.mp4` videos.
   - **Direct animation mode**: Proceed straight to animated SVG + 60fps MP4 export when the composition is already approved.

2. **Aspect Ratio & Output Resolution (1:1 Native Authoring)**
   - `3:2` (`viewBox="0 0 1620 1080"` — ideal for X/Twitter timeline cards, editorial data graphics, and thread media)
   - `16:9` (`viewBox="0 0 1920 1080"` — widescreen hero / YouTube)
   - `1:1` (`viewBox="0 0 1080 1080"` — square feed / profile centerpiece)
   - `4:5` (`viewBox="0 0 1080 1350"` — portrait feed stack)
   - `9:16` (`viewBox="0 0 1080 1920"` — Reels / Shorts / Stories)
   - Default video profile: `60 fps`, `10s–12s` loop, H.264 `yuv420p` (`-crf 14 -movflags +faststart`).

3. **Brand Identity, Real Data & Typography**
   - **Brand Grounds & Light**: Ground palette (e.g., Dark Obsidian/Canvas `#06090A`, Brand Field such as `#0E5661`, or Bone/Porcelain `#EDEBE6`), elevated recessed hardware chassis tones, primary/secondary ink, and **emissive accent light** (LEDs, arcs, active ticks, curve haloes).
   - **Vector Brandmark**: Official SVG paths kept strictly **single-color** where required by brand guidelines, preserving clear space (`>=` icon height) on all sides.
   - **Typography Pairing**: Use brand/editorial font files copied locally alongside the SVGs (for example `GeistSerif` / `Geist` Sans + `GeistMono`, with `font-variant-numeric: tabular-nums` on dynamic metrics). When copying font files on Windows whose names contain brackets like `[wght]`, always use `Copy-Item -LiteralPath`.
   - **Verified Real Data Only**: Inspect the live site, API docs, or user-supplied charts before writing numbers. Never invent prices, percentages, rankings, or timestamps.

4. **Jhosephe UI Components (`assets/ui/`)**
   Choose the hero instrument(s) from [aspect-ratios-and-components.md](./references/aspect-ratios-and-components.md) (`Dial`, `DetentDial`, `InstrumentBars`, `AudioMeter`, `FinancialChart`, `LunarEphemeris`, `AstronomyInstrument`, `TactileConsole`, `CameraWheel`, etc.) and read both the `.tsx` component and `assets/ui/theme.css` first.

---

## Phase 2: Swiss Grid Diagramming & Visual Restraint

1. **12-Column Architectural Grid (`1620×1080` canonical `3:2`) & Poster Restraint**
   - Outer safe margin: `72px–96px` left/right, top utility eyebrow at `y = 76..102`, footer lockup aligned at `y = 968..1016` with `>= icon height` clear space.
   - Use **invisible grid axes** and generous whitespace for typography alignment instead of drawing boxed stat tables, small metric cards, or dense multi-paragraph captions. Keep social compositions ultra-lean like high-craft brand posts: `1 eyebrow`, `1 large editorial headline`, at most `1 short subtitle or hero figure`, `1 sculpting/tactile hardware object`, and `1 clean footer`.
2. **Paper / Tactile Ground Texture & Real Hardware Shading (Zero Plastic 3D)**:
   - Give flat grounds subtle organic tactile grain/noise simulating archival paper (`<feTurbulence type="fractalNoise">` + `<feColorMatrix>` isolated strictly on a background rect inside `x="-20" y="-20" width="1660" height="1120"` so text and emissive LEDs stay razor sharp).
   - Default to **flat archival clarity** for charts, bars, and brand lockups; apply physical relief selectively to hero hardware controls (`Dial`, `LunarEphemeris`).
   - **Avoid "plastic bubble" spherical gradients**: For `Dial` knobs/medallions, model a **machined flat-top matte puck** (`165°` subtle linear top-to-bottom fill, `1px` crisp top-left chamfer catchlight, slightly offset extruded lower skirt, and soft directional contact shadow) rather than a bright center radial spotlight. For `LunarEphemeris`, feather the lunar terminator with a soft multi-stop twilight transition (`blur(16px)` penumbra under matte surface grain) rather than a sharp cutout edge.
   - Lift foreground hardware controls with multi-pass directional CSS `drop-shadow(...)` contact + cast shadows in `<style>`.
3. **Component Proportion Fidelity**: Match exact tick counts (`Dial`: `40` ticks `-135°..+135°`; `InstrumentBars`: `33` bars tall every 4th `i % 4 === 0`; `LunarEphemeris`: `28` synodic ticks; `AudioMeter`: `9–12` LED cells).
4. **Confined Light & Single-Focus Hierarchy**:
   - Headlines, body copy, and brand lockups remain sharp and unblurred (zero decorative outer glow on text).
   - Confine emissive glow strictly to hardware emitters (LED peaks, active radial arcs, active meter graduations, live curve beacon).
   - **XML Entity Safety**: Always escape literal ampersands inside SVG text/TSX strings as `&amp;`.

---

## Phase 3: SVG Lighting, Opening Speed & Motion Rules

1. **Author at 1:1 Native Scale**: Never wrap GPU-filtered geometry inside `transform="scale(...)"`. Author directly inside the exact pixel `viewBox`.
2. **Frame-0 Cover State (`todas as informações carregadas`) & Immediate Motion Rule (Critical for X/Social Videos)**:
   - Frame `0` (`t = 0.0s`) doubles as the **social post thumbnail/cover**. All headlines, eyebrows, metrics, brand marks, and full tactile instrument states **must render completely loaded, legible, and sharply positioned on frame 0** — never start with `opacity: 0`, hidden values, unlit charts, or empty bars waiting for an intro fade.
   - Start living motion immediately after frame `0` (telemetry pulse, curve breathing/scan sweep, LED peak hold, orbital rotation, dial detent cycle) and resolve smoothly back to the full loaded state before the loop boundary (`t = duration`) so both the cover thumbnail and seamless loop look effortless.
3. **GPU sRGB CSS Filters Instead of SVG Filter Primitives**:
   - Never use SVG `<feDropShadow>` or `<feGaussianBlur>` for glowing LEDs or hardware shadows (Software/Skia SVG filters darken/clip sRGB highlights).
   - Use CSS `filter: drop-shadow(...)` classes inside `<defs><style>` for crisp GPU-accelerated emission and recessed/contact shadows.
   - If using `<mask>`, add generous bounding padding (`>= 3×` blur radius) so glows never clip into visible rectangles.
4. **Full-Sweep Rotary Calibration**: For `Dial` / `DetentDial`, animate needles/pips across `-135°` to `+135°`, synchronize `pathLength="100"` arc strokes (`0 -> 100`), and highlight active detent cards strictly in phase with knob angle.
5. **Local `@font-face` Self-Containment**: Reference `./<FontName>.woff2` / `./<FontName>.ttf` in `<defs><style>`. Both `export-video.mjs` (automatic base64 data-URI inlining) and HTTP `<object type="image/svg+xml">` previews render the exact font weights cleanly.

---

## Phase 4: Verification, MP4 Export & Social Thread Packaging

1. **Visual Verification (`--preview`) — Isolate Per Variant**:
   Always pass a unique `--scratch` folder when checking multiple compositions so `preview_0..3.png` never overwrite each other, and inspect every PNG with `read_file`:
   ```sh
   node .agents/skills/jhosephe-svg-motion/scripts/export-video.mjs \
     --svg examples/brand/piece-3x2.svg \
     --width 1620 --height 1080 --duration 12 --bg "#06090A" \
     --scratch examples/brand/.render-tmp/piece --preview
   ```
2. **Export 60fps MP4 (After Static Draft Approval)**:
   ```sh
   node .agents/skills/jhosephe-svg-motion/scripts/export-video.mjs \
     --svg examples/brand/piece-3x2.svg \
     --out examples/brand/piece-1080-3x2.mp4 \
     --width 1620 --height 1080 --fps 60 --duration 12 --bg "#06090A" \
     --scratch examples/brand/.render-tmp/piece
   ```
   - Produces H.264 (`libx264`, `yuv420p`, `-crf 14`, `-preset slow`, `-movflags +faststart`) for crisp, zero-rebuffer playback on X/Twitter and browsers.
3. **Showcase & Social Posts / Threads**:
   - For multi-piece campaigns and X threads showing behind-the-scenes construction with exact MP4-to-post mapping, follow [posts-and-threads.md](./references/posts-and-threads.md).
   - Keep third-party brand client folders (`examples/<brand>/`) untracked/excluded if committing changes strictly to the core Jhosephe UI library & skill repository.
