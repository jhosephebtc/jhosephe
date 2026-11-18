import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = path.join(here, 'assets', 'kit', 'Zest Protocol media kit');
const logoSvg = fs.readFileSync(path.join(kit, 'logo', 'MAIN LOGO', 'ZEST_PROTOCOL_FINALES_LOGO O.svg'), 'utf8');
const orangePaths = [...logoSvg.matchAll(/<path class="st2" d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, ' '));
const markD = orangePaths[orangePaths.length - 1];
const wordD = orangePaths.slice(0, -1);

const ORANGE = '#FF6700';
const LIGHT = process.env.THEME === 'light';
const SUF = LIGHT ? '-light' : '';
const INK = LIGHT ? '#18191E' : '#F6F1EB';
const GRAY = LIGHT ? '#5B5D64' : '#A19F9A';
const CARD = LIGHT ? '#FFFFFF' : '#0E0E0F';
const LINE = LIGHT ? '#EBDDD1' : '#26262B';
const TRACK = LIGHT ? '#FBEEE3' : '#1A1A1E';
const MID1 = LIGHT ? '#C8CBD3' : '#55555C';
const MID2 = LIGHT ? '#E3E5EA' : '#323238';
const DASH = LIGHT ? '#9A9CA3' : '#66666D';
const FOOT = LIGHT ? '#6B6D74' : '#8A8A90';
const CREAM = LIGHT ? '#FFF6F0' : '#050505';
const W = 1620;
const H = 1080;

// Inner poster grid constants (card: x=96..1524, y=96..984; 84px inner padding)
const X0 = 180;
const X1 = 1440;
const FY = 876;

const fontCss = () => `
@font-face{font-family:'NHG';font-weight:700;src:url('./NeueHaasGroteskText-Bold.woff2') format('woff2');}
@font-face{font-family:'NHG';font-weight:500;src:url('./NeueHaasGroteskText-Medium.woff2') format('woff2');}
@font-face{font-family:'NHG';font-weight:400;src:url('./NeueHaasGroteskText-Regular.woff2') format('woff2');}
text{font-family:'NHG','Helvetica Neue',Arial,sans-serif;font-variant-numeric:tabular-nums;}
.h{font-weight:700;fill:${INK};letter-spacing:-2px;}
.eb{font-weight:500;fill:${GRAY};letter-spacing:3px;font-size:20px;}
.t{font-weight:400;fill:${GRAY};}
.m{font-weight:500;fill:${INK};}
.dash{fill:none;stroke:${DASH};stroke-width:1.4;stroke-dasharray:6 8;}
.bx{transform-box:fill-box;transform-origin:50% 100%;}
.cx{transform-box:fill-box;transform-origin:50% 50%;}
`;

const logo = (x, y, w) => {
  const s = w / 835.84;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(-12 -11)" fill="${ORANGE}">${wordD
    .map((d) => `<path d="${d}"/>`)
    .join('')}<path d="${markD}"/></g>`;
};

const corner = (x, y, c = ORANGE, s = 12) =>
  `<rect class="cx cn" x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="3.5" fill="${c}"/>`;

let tid = 0;
const roundTile = (x, y, w, h, r = 30, filled = false) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${filled ? TRACK : 'none'}" stroke="${LINE}" stroke-width="1.5"/>`;

// Endless mosaic of outlined rounded squares (pitch 132)
const mosaic = (opacity = 1) => {
  let o = '';
  for (let r = -1; r < 9; r++) {
    for (let c = -1; c < 13; c++) {
      const x = 18 + c * 132;
      const y = 14 + r * 132;
      if ((c * 3 + r * 5) % 7 === 0) continue;
      o += roundTile(x, y, 112, 112, 30, (c + r) % 4 === 0);
    }
  }
  return `<g opacity="${opacity}">${o}</g>`;
};

// Grainy orange "Fire" tile: clean vertical gradient, drifting warm core, ember base, film grain
const fireTile = (x, y, w, h, delay = 0, r = 32) => {
  const id = 'ft' + tid++;
  return `<clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A12"/><stop offset=".55" stop-color="#FF6700"/><stop offset="1" stop-color="#8A1D00"/></linearGradient>
<radialGradient id="${id}o"><stop offset="0" stop-color="#FFC27A" stop-opacity=".95"/><stop offset=".6" stop-color="#FF8A1F" stop-opacity=".35"/><stop offset="1" stop-color="#FF6700" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}d"><stop offset="0" stop-color="#2A0A00" stop-opacity=".9"/><stop offset="1" stop-color="#2A0A00" stop-opacity="0"/></radialGradient>
<g clip-path="url(#${id}c)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}g)"/>
<ellipse class="orb" cx="${x + w / 2}" cy="${y + h * 0.36}" rx="${w * 0.62}" ry="${h * 0.3}" fill="url(#${id}o)" style="animation-delay:${delay}s"/>
<ellipse class="emb" cx="${x + w / 2}" cy="${y + h * 0.95}" rx="${w * 0.2}" ry="${h * 0.4}" fill="url(#${id}d)" style="animation-delay:${delay}s"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#grain2)" opacity=".5"/></g>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#FFB070" stroke-opacity=".25" stroke-width="1.5"/>`;
};

const base = (id, body, css = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" id="${id}">
<defs><style>${fontCss()}
.cn{animation:cn 4s ease-in-out infinite}
@keyframes cn{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
.orb{animation:orb 8s ease-in-out infinite}@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(0,18px)}}
.emb{animation:emb 8s ease-in-out infinite}@keyframes emb{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.12)}}
.nzl{animation:nzl .3s steps(1) infinite}@keyframes nzl{0%,33.3%{opacity:.45}33.4%,100%{opacity:0}}
${css}</style>
<filter id="grain" x="-20" y="-20" width="1660" height="1120"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 0.6  0 0 0 0 0.3  0 0 0 0.04 0"/></filter>
<filter id="grain2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 0"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7 0.55" numOctaves="5" seed="3" result="n"/><feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="1.4" result="l"><feDistantLight azimuth="45" elevation="62"/></feDiffuseLighting><feColorMatrix in="l" type="saturate" values="0"/></filter>
<filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 1.4 -0.55"/></filter>
<filter id="nz1" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="21"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="nz2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="47"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="nz3" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="83"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="${CREAM}"/>
<rect x="-20" y="-20" width="1660" height="1120" filter="url(#grain)"/>
${mosaic(0.85)}
${body}
<rect x="0" y="0" width="${W}" height="${H}" filter="url(#paper)" style="mix-blend-mode:${LIGHT ? 'multiply' : 'soft-light'}" opacity="${LIGHT ? 0.5 : 0.45}"/>
<rect x="0" y="0" width="${W}" height="${H}" filter="url(#fibre)" style="mix-blend-mode:${LIGHT ? 'multiply' : 'screen'}" opacity="${LIGHT ? 0.3 : 0.08}"/>
<rect class="nzl" x="0" y="0" width="${W}" height="${H}" filter="url(#nz1)" style="mix-blend-mode:overlay"/>
<rect class="nzl" x="0" y="0" width="${W}" height="${H}" filter="url(#nz2)" style="mix-blend-mode:overlay;animation-delay:-.1s"/>
<rect class="nzl" x="0" y="0" width="${W}" height="${H}" filter="url(#nz3)" style="mix-blend-mode:overlay;animation-delay:-.2s"/>
</svg>`;

const poster = (id, eyebrow, content, css = '') => {
  const body = `
<rect x="96" y="96" width="1428" height="888" fill="${CARD}" fill-opacity="${LIGHT ? 0.96 : 0.94}" stroke="${LINE}" stroke-width="1.5" rx="44"/>
${corner(96, 96, INK)}${corner(1524, 96, INK)}${corner(96, 984, INK)}${corner(1524, 984, INK)}
<text class="eb" x="${X0}" y="176">${eyebrow}</text>
${content}
<line x1="${X0}" y1="${FY}" x2="${X1}" y2="${FY}" stroke="${LINE}" stroke-width="1.5"/>
<rect x="${X0 - 4}" y="${FY - 4}" width="8" height="8" rx="2" fill="${INK}"/><rect x="${X1 - 4}" y="${FY - 4}" width="8" height="8" rx="2" fill="${INK}"/>
${logo(X0, 910, 182)}
<text class="m" x="${X1}" y="944" text-anchor="end" font-size="26" style="fill:${FOOT}">zestprotocol.com</text>`;
  return base(id, body, css);
};

const pieces = {};

// 1. Hero ------------------------------------------------------------------
{
  const body = `
${fireTile(108, 220, 216, 640, 0, 38)}${fireTile(1296, 220, 216, 640, -2, 38)}
<rect x="360" y="220" width="900" height="640" fill="${CARD}" fill-opacity="${LIGHT ? 0.96 : 0.94}" rx="44" stroke="${LINE}" stroke-width="1.5"/>
${corner(360, 220)}${corner(1260, 220)}${corner(360, 860)}${corner(1260, 860)}
${logo(715, 310, 190)}
<text class="h" x="810" y="476" text-anchor="middle" font-size="86">The Capital Layer</text>
<text class="h" x="810" y="570" text-anchor="middle" font-size="86">for Bitcoin.</text>
<text class="t" x="810" y="656" text-anchor="middle" font-size="28">Zest Protocol turns Bitcoin from idle asset</text>
<text class="t" x="810" y="696" text-anchor="middle" font-size="28">into productive capital.</text>
<text class="eb" x="810" y="790" text-anchor="middle" style="font-size:18px">VAULTS  ·  LENDING  ·  SWAP</text>`;
  pieces['zest-hero-3x2'] = base('zest-hero', body);
}

// 2. Track record ----------------------------------------------------------
{
  const cols = [
    ['$100M', 'peak TVL'],
    ['2+', 'years on mainnet'],
    ['Zero', 'bad debt'],
  ];
  let c = '';
  cols.forEach((col, i) => {
    const x = X0 + i * 435;
    c += `<text class="h" x="${x}" y="536" font-size="116">${col[0]}</text>
<text class="m" x="${x}" y="596" font-size="32" style="fill:${GRAY}">${col[1]}</text>`;
    for (let k = 0; k < 20; k++) {
      const tall = k % 5 === 0;
      c += `<rect class="bx tk" x="${x + k * 19}" y="${tall ? 660 : 680}" width="4" height="${tall ? 90 : 70}" rx="2" fill="${ORANGE}" style="animation-delay:${-(((k * 0.18 + i * 0.7) % 4)).toFixed(2)}s"/>`;
    }
  });
  const content = `
${fireTile(1140, 220, 300, 114, -1, 28)}
<text class="h" x="${X0}" y="298" font-size="84">Proofs, not promises.</text>
<line x1="${X0}" y1="386" x2="${X1}" y2="386" stroke="${LINE}" stroke-width="1.5"/>
${c}`;
  pieces['zest-track-record-3x2'] = poster('zest-track', 'ZEST PROTOCOL  ·  TRACK RECORD', content,
    `.tk{animation:tk 4s ease-in-out infinite}@keyframes tk{0%,100%{transform:scaleY(1);opacity:1}50%{transform:scaleY(.55);opacity:.4}}`);
}

// 3. Q3 loans waterfall ----------------------------------------------------
{
  const base0 = 780;
  const k = 24;
  const bar = (x, w, v0, v1, fill, cls, label, val) => {
    const y = base0 - v1 * k;
    const h = (v1 - v0) * k;
    return `<rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}"/>
<text class="h" x="${x + w / 2}" y="${y - 20}" text-anchor="middle" font-size="42" style="letter-spacing:-1px">${val}</text>
<text class="m" x="${x + w / 2}" y="${base0 + 38}" text-anchor="middle" font-size="22" style="fill:${GRAY}">${label}</text>`;
  };
  const content = `
<text class="h" x="${X0}" y="292" font-size="76">Loans on Zest</text>
<text class="h" x="${X0}" y="378" font-size="76">rose <tspan fill="${ORANGE}" style="fill:${ORANGE}">132%</tspan> in Q3.</text>
<text class="h" x="${X0}" y="576" font-size="112" style="fill:${ORANGE}">$14.75M</text>
<text class="m" x="${X0}" y="628" font-size="28" style="fill:${GRAY}">debt on Sep 30, 2026</text>
${fireTile(X0, 686, 280, 94, -3, 24)}
<line x1="760" y1="${base0}" x2="${X1}" y2="${base0}" stroke="${INK}" stroke-width="2"/>
<line class="dash" x1="760" y1="${base0 - 14.75 * k}" x2="${X1}" y2="${base0 - 14.75 * k}"/>
${bar(780, 168, 0, 6.37, '#FFB88A', 'b1', 'Debt, Jun 30', '$6.37M')}
${bar(996, 168, 6.37, 12.59, MID1, 'b2', 'New sBTC loans', '+$6.22M')}
${bar(1242, 168, 0, 14.75, ORANGE, 'b3', 'Debt, Sep 30', '$14.75M')}
<path class="dash" d="M948 ${base0 - 6.37 * k} L996 ${base0 - 6.37 * k} M1164 ${base0 - 12.59 * k} L1242 ${base0 - 14.75 * k}" style="animation:dashmove 8s linear infinite"/>`;
  pieces['zest-q3-loans-3x2'] = poster('zest-q3', 'ZEST PROTOCOL  ·  Q3 2026 LENDING', content,
    `@keyframes dashmove{from{stroke-dashoffset:0}to{stroke-dashoffset:-28}}
.b1{animation:br 4s ease-in-out infinite}.b2{animation:br 4s ease-in-out -1.3s infinite}.b3{animation:br 4s ease-in-out -2.6s infinite}
@keyframes br{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.955)}}`);
}

// 4. Bitcoin Collateral Vaults flow ---------------------------------------
{
  const y = 632;
  const seg = (x1, x2, d) => `<line class="dash" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" style="animation:dashmove 8s linear infinite"/>
<circle cx="${x1}" cy="${y}" r="8" fill="${ORANGE}" style="animation:run${d} 4s linear infinite"/>`;
  const content = `
${fireTile(1140, 220, 300, 164, -2, 30)}
<text class="h" x="${X0}" y="292" font-size="76">Deposit native BTC.</text>
<text class="h" x="${X0}" y="378" font-size="76">Borrow Ethereum USDC.</text>
<line x1="${X0}" y1="444" x2="${X1}" y2="444" stroke="${LINE}" stroke-width="1.5"/>
${seg(420, 696, 'A')}${seg(924, 1200, 'B')}
<g class="cx" style="animation:tilt 8s ease-in-out infinite"><rect x="268" y="${y - 62}" width="124" height="124" fill="${ORANGE}" transform="rotate(45 330 ${y})" rx="16"/></g>
<text class="h" x="330" y="${y + 22}" text-anchor="middle" font-size="70" style="fill:#fff;letter-spacing:0">₿</text>
<circle class="dash" cx="810" cy="${y}" r="96" style="animation:dashmove 8s linear infinite"/>
<g style="transform-origin:810px ${y}px;animation:spin 8s linear infinite"><circle cx="906" cy="${y}" r="7" fill="${INK}"/></g>
<rect x="750" y="${y - 50}" width="120" height="100" rx="18" fill="${CARD}" stroke="${INK}" stroke-width="3"/>
<path d="M786 ${y - 50} v-22 a24 24 0 0 1 48 0 v22" fill="none" stroke="${INK}" stroke-width="3"/>
<circle cx="810" cy="${y - 4}" r="10" fill="${ORANGE}"/><rect x="806" y="${y + 4}" width="8" height="20" rx="3" fill="${ORANGE}"/>
<circle cx="1290" cy="${y}" r="66" fill="#2775CA"/>
<text class="h" x="1290" y="${y + 15}" text-anchor="middle" font-size="42" style="fill:#fff;letter-spacing:0">USDC</text>
<text class="m" x="330" y="${y + 150}" text-anchor="middle" font-size="26">Native BTC</text>
<text class="m" x="810" y="${y + 150}" text-anchor="middle" font-size="26">Vault</text>
<text class="m" x="1290" y="${y + 150}" text-anchor="middle" font-size="26">USDC</text>`;
  pieces['zest-collateral-vaults-3x2'] = poster('zest-vault', 'ZEST PROTOCOL  ·  BITCOIN COLLATERAL VAULTS', content,
    `@keyframes dashmove{from{stroke-dashoffset:0}to{stroke-dashoffset:-28}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes runA{0%{transform:translateX(0)}100%{transform:translateX(276px)}}
@keyframes runB{0%{transform:translateX(0)}100%{transform:translateX(276px)}}
@keyframes tilt{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`);
}

// 5. Rates board -----------------------------------------------------------
{
  const rows = [
    ['Earn', 5.09, '5.09%'],
    ['Borrow USDCx', 3.71, '3.71%'],
    ['Supply STX', 2.55, '2.55%'],
    ['Supply sBTC', 0.94, '0.94%'],
  ];
  let r = '';
  const bx = 500;
  const full = 700;
  rows.forEach((row, i) => {
    const y = 376 + i * 104;
    const w = (row[1] / 5.09) * full;
    r += `<text class="m" x="${X0}" y="${y + 39}" font-size="34">${row[0]}</text>
<rect x="${bx}" y="${y}" width="${full}" height="56" rx="14" fill="${TRACK}"/>
<rect class="sx" x="${bx}" y="${y}" width="${w}" height="56" rx="14" fill="${i === 0 ? ORANGE : '#FFB88A'}" style="animation-delay:${-i * 0.8}s"/>
<text class="h" x="${X1}" y="${y + 46}" text-anchor="end" font-size="58" style="letter-spacing:-1px;${i === 0 ? `fill:${ORANGE}` : ''}">${row[2]}</text>`;
  });
  const content = `
<text class="h" x="${X0}" y="294" font-size="76">Zest rates</text>
<rect x="810" y="232" width="630" height="76" rx="22" fill="${TRACK}"/>
<text class="m" x="1125" y="280" text-anchor="middle" font-size="28">$71,215,494 TVL  ·  800.94 BTC</text>
${r}`;
  pieces['zest-rates-3x2'] = poster('zest-rates', 'ZEST PROTOCOL  ·  LIVE MARKETS', content,
    `.sx{transform-box:fill-box;transform-origin:0 50%;animation:sx 4s ease-in-out infinite}
@keyframes sx{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.965)}}`);
}

// 6. CLMM ------------------------------------------------------------------
{
  let bars = '';
  const n = 33;
  const x0 = X0;
  const pitch = 25;
  const baseY = 804;
  for (let i = 0; i < n; i++) {
    const h = 34 + 270 * Math.exp(-(((i - 16) / 7.2) ** 2));
    const active = i >= 11 && i <= 21;
    bars += `<rect class="bx lq" x="${x0 + i * pitch}" y="${baseY - h}" width="17" height="${h.toFixed(1)}" rx="4" fill="${active ? ORANGE : MID2}" style="animation-delay:${-(i * 0.12).toFixed(2)}s"/>`;
  }
  const cxp = x0 + 16 * pitch + 8.5;
  const topY = baseY - (34 + 270);
  const content = `
${fireTile(1140, 220, 300, 164, -4, 30)}
<text class="h" x="${X0}" y="292" font-size="76">Concentrated liquidity</text>
<text class="h" x="${X0}" y="378" font-size="76">is live on Stacks.</text>
${bars}
<line x1="${x0}" y1="${baseY}" x2="${x0 + n * pitch - 8}" y2="${baseY}" stroke="${INK}" stroke-width="2"/>
<line class="dash" x1="${x0 + 11 * pitch - 4}" y1="${topY - 12}" x2="${x0 + 11 * pitch - 4}" y2="${baseY}"/>
<line class="dash" x1="${x0 + 22 * pitch - 4}" y1="${topY - 12}" x2="${x0 + 22 * pitch - 4}" y2="${baseY}"/>
<circle class="cx pr" cx="${cxp}" cy="${topY}" r="9" fill="${INK}"/>
<circle class="cx pr2" cx="${cxp}" cy="${topY}" r="9" fill="none" stroke="${INK}" stroke-width="2"/>
<text class="h" x="1100" y="572" font-size="52">STX / USDCx</text>
<text class="h" x="1100" y="640" font-size="52">ZEST / STX</text>
<line x1="1100" y1="684" x2="${X1}" y2="684" stroke="${LINE}" stroke-width="1.5"/>
<text class="h" x="1100" y="758" font-size="56" style="fill:${ORANGE}">100k STX</text>
<text class="t" x="1100" y="798" font-size="24">rewards for early traders</text>`;
  pieces['zest-clmm-3x2'] = poster('zest-clmm', 'ZEST PROTOCOL  ·  CLMM ON STACKS MAINNET', content,
    `.lq{animation:lq 4s ease-in-out infinite}@keyframes lq{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.9)}}
.pr2{animation:pr2 2s ease-out infinite}@keyframes pr2{0%{transform:scale(1);opacity:.9}100%{transform:scale(3.2);opacity:0}}`);
}

// 7. Quote: vault explainer (CoinMarketCap Community)
{
  const hl = (t) => `<tspan style="fill:${ORANGE}">${t}</tspan>`;
  const lines = [
    'Instead of dumping coins into',
    'a giant collective pool, a borrower',
    `sends ${hl('native BTC')} into a personal,`,
    'single-user vault on the Bitcoin',
    'blockchain.',
  ];
  const content = `
${fireTile(1320, 214, 120, 120, -2, 28)}
<text class="h" x="${X0 - 6}" y="356" font-size="160" style="fill:${ORANGE};letter-spacing:0">“</text>
${lines.map((l, i) => `<text class="h" x="${X0}" y="${432 + i * 78}" font-size="58" style="letter-spacing:-1.5px">${l}</text>`).join('')}`;
  pieces['zest-quote-vault-3x2'] = poster('zest-quote-vault', 'FEATURED IN COINMARKETCAP COMMUNITY', content);
}

// 8. Quote: mission (@ZestProtocol)
{
  const content = `
${fireTile(1020, 220, 420, 588, -2, 36)}
<text class="h" x="${X0 - 6}" y="360" font-size="160" style="fill:${ORANGE};letter-spacing:0">“</text>
<text class="h" x="${X0}" y="504" font-size="108" style="letter-spacing:-3.5px">Mission stays</text>
<text class="h" x="${X0}" y="620" font-size="108" style="letter-spacing:-3.5px">the same,</text>
<text class="h" x="${X0}" y="736" font-size="108" style="letter-spacing:-3.5px;fill:${ORANGE}">keep building.</text>`;
  pieces['zest-quote-mission-3x2'] = poster('zest-quote-mission', '@ZESTPROTOCOL', content);
}

for (const [name, svg] of Object.entries(pieces)) {
  fs.writeFileSync(path.join(here, `${name}${SUF}.svg`), svg);
}
console.log('Generated', Object.keys(pieces).join(', '));
