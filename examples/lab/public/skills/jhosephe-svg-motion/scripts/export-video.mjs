import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function findFfmpegExecutable(scratchDir) {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  const localStatic = path.join(scratchDir, 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  if (fs.existsSync(localStatic)) return localStatic;
  return 'ffmpeg';
}

const args = parseArgs(process.argv.slice(2));
if (!args.svg) {
  console.error('Usage: node export-video.mjs --svg <path.svg> [--out <path.mp4>] [--width 1620] [--height 1080] [--fps 60] [--duration 12] [--bg #070c0a] [--preview]');
  process.exit(1);
}

const svgPath = path.resolve(args.svg);
const svgDir = path.dirname(svgPath);
const width = Number(args.width || 1620);
const height = Number(args.height || 1080);
const fps = Number(args.fps || 60);
const duration = Number(args.duration || 12);
const bg = args.bg || '#060606';
const previewOnly = Boolean(args.preview);
const outPath = path.resolve(args.out || svgPath.replace(/\.svg$/i, '.mp4'));
const scratchDir = path.resolve(args.scratch || path.join(svgDir, '.render-tmp'));
const framesDir = path.join(scratchDir, 'frames');

const require = createRequire(path.resolve(process.cwd(), 'package.json'));
const { chromium } = require('playwright');

fs.mkdirSync(framesDir, { recursive: true });

// Inline local font files referenced in @font-face as base64 data URIs so headless browser loads them without needing an HTTP server
let svgContent = fs.readFileSync(svgPath, 'utf8');
svgContent = svgContent.replace(/url\((['"]?)\.\/([^)'"]+\.(?:ttf|otf|woff2?))\1\)/gi, (match, _q, relFile) => {
  const fontFile = path.join(svgDir, relFile);
  if (!fs.existsSync(fontFile)) return match;
  const ext = path.extname(relFile).toLowerCase();
  const mime = ext === '.woff2' ? 'font/woff2' : ext === '.woff' ? 'font/woff' : ext === '.otf' ? 'font/otf' : 'font/ttf';
  const b64 = fs.readFileSync(fontFile).toString('base64');
  return `url('data:${mime};base64,${b64}')`;
});

const browser = await chromium.launch({
  executablePath: findBrowserExecutable(),
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: ${bg}; }
      svg { display: block; width: ${width}px; height: ${height}px; }
    </style>
  </head>
  <body>${svgContent}</body>
</html>`, { waitUntil: 'networkidle' });

  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const anim of document.getAnimations()) anim.pause();
  });

  if (previewOnly) {
    const stops = [0.04, 0.31, 0.56, 0.81];
    for (let idx = 0; idx < stops.length; idx++) {
      const tMs = stops[idx] * duration * 1000;
      await page.evaluate(t => {
        for (const a of document.getAnimations()) a.currentTime = t;
        if (typeof window.__seekSvgTime === 'function') window.__seekSvgTime(t);
      }, tMs);
      const previewFile = path.join(scratchDir, `preview_${idx}.png`);
      await page.screenshot({ path: previewFile });
      console.log('Saved preview:', previewFile);
    }
  } else {
    const totalFrames = Math.round(fps * duration);
    for (let i = 0; i < totalFrames; i++) {
      const tMs = (i / fps) * 1000;
      await page.evaluate(t => {
        for (const a of document.getAnimations()) a.currentTime = t;
        if (typeof window.__seekSvgTime === 'function') window.__seekSvgTime(t);
      }, tMs);
      await page.screenshot({ path: path.join(framesDir, `frame_${String(i).padStart(4, '0')}.png`) });
      if (i % 120 === 0) console.log(`Captured ${i}/${totalFrames}`);
    }

    const ffmpegBin = findFfmpegExecutable(scratchDir);
    execFileSync(ffmpegBin, [
      '-y',
      '-framerate', String(fps),
      '-i', path.join(framesDir, 'frame_%04d.png'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '14',
      '-preset', 'slow',
      '-movflags', '+faststart',
      outPath,
    ], { stdio: 'inherit' });
    console.log('Exported MP4:', outPath);
  }
} finally {
  await browser.close();
}
