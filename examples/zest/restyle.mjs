import fs from 'node:fs';
const p = 'examples/zest/generate.mjs';
let s = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) console.log('MISSING', a); s = s.split(a).join(b); };

rep("const INK = '#18191E';", "const INK = '#F6F1EB';");
rep("const GRAY = '#5B5D64';", "const GRAY = '#A19F9A';\nconst CARD = '#0E0E0F';\nconst LINE = '#2B2B30';\nconst TRACK = '#1C1C1F';");
rep("const CREAM = '#FFF6F0';", "const CREAM = '#050505';");
rep("stroke:#7A7C84", "stroke:#6A6A70");
rep('fill="#fff" stroke="#E6DDD6" stroke-width="1.5"', 'fill="${CARD}" fill-opacity=".9" stroke="${LINE}" stroke-width="1.5" rx="44"');
rep('stroke="#DAD3CD"', 'stroke="${LINE}"');
rep("fill=\"#F4EFEA\"", 'fill="${TRACK}"');
rep('fill="#FFF6F0"/>\n<text class="eb" x="188"', 'fill="${TRACK}" rx="22"/>\n<text class="eb" x="188"');
rep("'#C8CBD3'", "'#55555C'");
rep("'#D6D8DE'", "'#34343A'");
rep('fill="#fff" stroke="${INK}" stroke-width="3"', 'fill="${CARD}" stroke="${INK}" stroke-width="3"');
rep("style=\"fill:#6B6D74\"", 'style="fill:#8A8A90"');
rep("0 0 0 0 0.55  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.05 0", "0 0 0 0 1  0 0 0 0 0.6  0 0 0 0 0.3  0 0 0 0.05 0");
// hero card + circles replaced
rep('<rect x="380" y="300" width="860" height="480" fill="#fff"/>', '<rect x="380" y="300" width="860" height="480" fill="${CARD}" rx="44" stroke="${LINE}" stroke-width="1.5"/>');
// corners (square markers) -> softer rounded
rep('<rect class="cx cn" x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" fill="${c}"/>', '<rect class="cx cn" x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="4" fill="${c}"/>');

// tile helpers
rep("const base = (id, body, css = '') =>", `
let tid = 0;
const roundTile = (x, y, w, h, r = 40, filled = false) =>
  \`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" rx="\${r}" fill="\${filled ? TRACK : 'none'}" stroke="\${LINE}" stroke-width="1.5"/>\`;

// Endless mosaic of outlined rounded squares (pitch 132) with a soft interlocking silhouette
const mosaic = (opacity = 1) => {
  let o = '';
  for (let r = -1; r < 9; r++) for (let c = -1; c < 13; c++) {
    const x = 18 + c * 132, y = 14 + r * 132;
    if ((c * 3 + r * 5) % 7 === 0) continue;
    o += roundTile(x, y, 112, 112, 30, (c + r) % 4 === 0);
  }
  return \`<g opacity="\${opacity}">\${o}</g>\`;
};

// Grainy orange "Fire" tile: vertical gradient, drifting glow orb, dark ember column, film grain
const fireTile = (x, y, w, h, delay = 0, r = 40) => {
  const id = 'ft' + tid++;
  return \`<clipPath id="\${id}c"><rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" rx="\${r}"/></clipPath>
<linearGradient id="\${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A12"/><stop offset=".55" stop-color="#FF6700"/><stop offset="1" stop-color="#8A1D00"/></linearGradient>
<radialGradient id="\${id}o"><stop offset="0" stop-color="#FFC27A" stop-opacity=".95"/><stop offset=".6" stop-color="#FF8A1F" stop-opacity=".35"/><stop offset="1" stop-color="#FF6700" stop-opacity="0"/></radialGradient>
<radialGradient id="\${id}d"><stop offset="0" stop-color="#2A0A00" stop-opacity=".9"/><stop offset="1" stop-color="#2A0A00" stop-opacity="0"/></radialGradient>
<g clip-path="url(#\${id}c)"><rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" fill="url(#\${id}g)"/>
<ellipse class="orb" cx="\${x + w / 2}" cy="\${y + h * 0.36}" rx="\${w * 0.62}" ry="\${h * 0.3}" fill="url(#\${id}o)" style="animation-delay:\${delay}s"/>
<ellipse class="emb" cx="\${x + w / 2}" cy="\${y + h * 0.95}" rx="\${w * 0.2}" ry="\${h * 0.4}" fill="url(#\${id}d)" style="animation-delay:\${delay}s"/>
<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" filter="url(#grain2)" opacity=".55"/></g>
<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" rx="\${r}" fill="none" stroke="#FFB070" stroke-opacity=".25" stroke-width="1.5"/>\`;
};

const base = (id, body, css = '') =>`);
rep('</filter>\n</defs>', '</filter>\n<filter id="grain2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 0"/></filter>\n</defs>');
rep('${css}</style>', '.orb{animation:orb 8s ease-in-out infinite}@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(0,18px)}}.emb{animation:emb 8s ease-in-out infinite}@keyframes emb{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.12)}}\n${css}</style>');
rep('<rect x="-20" y="-20" width="1660" height="1120" filter="url(#grain)"/>\n${body}', '<rect x="-20" y="-20" width="1660" height="1120" filter="url(#grain)"/>\n${mosaic(0.9)}\n${body}');

// hero: replace circles/orbits with fire tiles flanking the card
rep("${circle(120, 540, 240)}${circle(330, 540, 240)}${circle(1500, 540, 240)}${circle(1290, 540, 240)}\n${orbit(120, 540, 240, 8)}${orbit(1500, 540, 240, 8)}", "${fireTile(92, 300, 252, 480, 0)}${fireTile(1276, 300, 252, 480, -2)}");
rep('<line class="dash" x1="0" y1="300" x2="${W}" y2="300"/><line class="dash" x1="0" y1="780" x2="${W}" y2="780"/>\n<line class="dash" x1="380" y1="0" x2="380" y2="${H}" style="stroke-dasharray:0"/>', '');

// poster: add small fire tile in bottom-right footer area
rep('${logo(156, 930, 190)}\n<text class="m" x="1464" y="966"', '${logo(156, 930, 190)}\n<text class="m" x="1464" y="966"');
fs.writeFileSync(p, s);
