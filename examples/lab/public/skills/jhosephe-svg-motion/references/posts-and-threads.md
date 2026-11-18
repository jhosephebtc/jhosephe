# Social Posts, Launch Videos & X Thread Playbook

Standardizes how **Jhosephe UI** components and brand animations are planned, rendered, and packaged into high-retention X/Twitter video posts and build-in-public threads.

## 1. Non-Negotiable Feed Opening & Motion Rules

1. **Frame-0 Cover Poster Invariant (`t = 0.0s` Fully Loaded)**:
   - Social platforms use frame `0` (`t = 0s`) as the paused cover thumbnail before autoplay begins.
   - Every headline, metric, delta, brand lockup, curve trace, and illuminated instrument graduation **must be completely visible and loaded on frame 0**. Animate continuously *from* the full loaded composition (live telemetry pulses, subtle curve tracer highlights, LED VU modulation, rotary detent sweep returning smoothly to home at `t = duration`) rather than fading in from an empty canvas.
2. **Draft-First Campaign Workflow**:
   - Generate all compositions as **static `3:2` (`1620×1080`) SVGs** first (`index.html` comparison grid + `--preview` PNG inspection).
   - Verify grid symmetry, real factual numbers, typography weights (`GeistSerif`, `Geist`, `GeistMono`), clear margins, and single-color logo integrity before adding CSS/SMIL animations or encoding MP4s.
4. **Native `3:2` X/Twitter Encoding Profile**:
   - Resolution: `1620×1080` (`1:1` SVG `viewBox`, `60 fps`, `8s–12s` seamless loop).
   - Codec: `libx264`, `-pix_fmt yuv420p`, `-crf 14`, `-preset slow`, `-movflags +faststart`.
   - Zero soft banding (glowing `<circle style="filter: blur(110px)" />` or GPU CSS `drop-shadow` in `<style>`).

---

## 2. X / Twitter Thread Architecture (Showcase + Build Breakdown)

When turning a multi-video brand showcase into a technical X thread, match each post strictly to the exact component video that demonstrates its engineering concept:

| Thread Post | Narrative Purpose | Attached Media Slot | Core Points to Highlight |
| --- | --- | --- | --- |
| **Post 1 (Hook)** | Result first — tactile brand identity in motion | **Hero Medallion / Coin Video** (strongest sculptural centerpiece at frame 0) | Brand concept + why pure vector CSS/SVG depth beats generic templates; open-source stack attribution (`jhosephe` UI + `jhosephe-svg-motion`). |
| **Post 2 (Precision Telemetry)** | Hardware scales & real data | **`InstrumentBars` Video** (`33`-bar scale / live KPIs) | How `33` machined graduations align every 4th tall bar directly to real metrics on a 12-column Swiss grid. |
| **Post 3 (Live Charts & LEDs)** | Confined light vs. clean ink | **`FinancialChart` + `AudioMeter` Video** | Keeping headlines unblurred while confining blue-green/brand glow strictly to LED peaks, chart splines, and beacon halos. |
| **Post 4 (Rotary Controls)** | Physical feedback & state routing | **`Dial` / `DetentDial` Video** (`-135°..+135°` sweep) | Calibrating 40 ticks, `pathLength="100"` illuminated arcs, sculpted dome gradients, and orthogonal bus traces synced to active stops. |
| **Post 5 (Workflow & Stack CTA)** | Reproducible pipeline (`60fps` MP4) | **`LunarEphemeris` / Loop Recap Video** | Static draft verification (`--preview`), local `@font-face` base64 bundling, GPU sRGB shadows over Chromium headless + FFmpeg (`yuv420p`), and link to the Vercel UI showcase & downloadable skill. |

### Copy & Attribution Guidelines for Threads
- Tag the showcased protocol/company account accurately once in the opening post cleanly.
- Lead with what the viewer sees in seconds (`0s` hook), follow with concise **engineering "how it's built"** mechanics (concrete numbers: `33` bars, `40` ticks, `<= 0.5s` header settle, `60fps`), never fluff.
- Always double-check that every metric displayed inside the video matches verified live docs/posts from the featured brand.

---

## 3. Pre-Publish Quality Checklist

- [ ] Frame `0` (`preview_0.png`): Title, eyebrow, brand mark, and hero instrument are readable and unclipped?
- [ ] `t = 0.5s`: All typography fully settled (`opacity: 1`), zero slow blank intro?
- [ ] Zero overlapping axis labels, clipped CSS/SVG `<mask>` boxes, or unescaped `&` XML errors?
- [ ] Correct `.woff2` / `.ttf` weights loaded via `document.fonts.ready` inside Chrome?
- [ ] Each MP4 checked visually and paired with the matching X thread post?
