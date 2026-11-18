import fs from 'node:fs';
const p = 'examples/zest/generate.mjs';
let s = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) console.log('MISSING', a.slice(0, 70)); s = s.split(a).join(b); };

rep("const MID1 = LIGHT ? '#C8CBD3' : MID1;", "const MID1 = LIGHT ? '#C8CBD3' : '#55555C';");
rep("const MID2 = LIGHT ? '#E3E5EA' : MID2;", "const MID2 = LIGHT ? '#E3E5EA' : '#34343A';");

// filters: paper fibres, animated film noise
rep('</filter>\n</defs>', `</filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7 0.55" numOctaves="5" seed="3" result="n"/><feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="1.6" result="l"><feDistantLight azimuth="45" elevation="62"/></feDiffuseLighting><feColorMatrix in="l" type="saturate" values="0"/></filter>
<filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 1.6 -0.55"/></filter>
<filter id="nz1" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="21"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="nz2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="47"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="nz3" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="83"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>`);
rep('${css}</style>', `.ghost :not(text):not(tspan){display:none}.ghost text{fill:\${ORANGE}!important}.ghost{filter:blur(9px);opacity:.34}
.blob{filter:blur(90px)}.blobf{animation:blobf 8s ease-in-out infinite}@keyframes blobf{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-24px)}}
.nzl{animation:nzl .3s steps(1) infinite}@keyframes nzl{0%,33.3%{opacity:.5}33.4%,100%{opacity:0}}
\${css}</style>`);
// blobs behind + overlays on top
rep('${mosaic(0.9)}\n${body}\n</svg>', `\${mosaic(0.9)}
<g class="blob blobf" opacity="\${LIGHT ? 0.5 : 0.42}"><ellipse cx="260" cy="900" rx="330" ry="150" fill="#FF6700"/><ellipse cx="1380" cy="170" rx="300" ry="130" fill="#E12400"/><ellipse cx="1260" cy="930" rx="220" ry="110" fill="#6232E5" opacity=".55"/></g>
\${body}
<rect x="0" y="0" width="\${W}" height="\${H}" filter="url(#paper)" style="mix-blend-mode:\${LIGHT ? 'multiply' : 'soft-light'}" opacity="\${LIGHT ? 0.55 : 0.5}"/>
<rect x="0" y="0" width="\${W}" height="\${H}" filter="url(#fibre)" style="mix-blend-mode:\${LIGHT ? 'multiply' : 'screen'}" opacity="\${LIGHT ? 0.35 : 0.1}"/>
<rect class="nzl" x="0" y="0" width="\${W}" height="\${H}" filter="url(#nz1)" style="mix-blend-mode:overlay"/>
<rect class="nzl" x="0" y="0" width="\${W}" height="\${H}" filter="url(#nz2)" style="mix-blend-mode:overlay;animation-delay:-.1s"/>
<rect class="nzl" x="0" y="0" width="\${W}" height="\${H}" filter="url(#nz3)" style="mix-blend-mode:overlay;animation-delay:-.2s"/>
</svg>`);
// ghost copy of poster content (blurred orange echo of the headline)
rep('${content}\n<line x1="156" y1="898"', '<g class="ghost" transform="translate(7 7)">${content}</g>\n${content}\n<line x1="156" y1="898"');

// quote pieces
rep("for (const [name, svg] of Object.entries(pieces))", `// 7. Quote: vault explainer (CoinMarketCap Community)
{
  const hl = (t) => \`<tspan style="fill:\${ORANGE}">\${t}</tspan>\`;
  const lines = [
    'Instead of dumping coins into',
    'a giant collective pool, a borrower',
    \`sends \${hl('native BTC')} into a personal,\`,
    'single-user vault on the Bitcoin',
    'blockchain.',
  ];
  const content = \`
<text class="h" x="150" y="372" font-size="240" style="fill:\${ORANGE};letter-spacing:0">“</text>
\${lines.map((l, i) => \`<text class="h" x="156" y="\${430 + i * 82}" font-size="64" style="letter-spacing:-1.5px">\${l}</text>\`).join('')}\`;
  pieces['zest-quote-vault-3x2'] = poster('zest-quote-vault', 'FEATURED IN COINMARKETCAP COMMUNITY', '', content);
}

// 8. Quote: mission (@ZestProtocol)
{
  const content = \`
\${fireTile(1010, 200, 454, 650, -2)}
<text class="h" x="150" y="372" font-size="240" style="fill:\${ORANGE};letter-spacing:0">“</text>
<text class="h" x="156" y="540" font-size="118" style="letter-spacing:-4px">Mission stays</text>
<text class="h" x="156" y="662" font-size="118" style="letter-spacing:-4px">the same,</text>
<text class="h" x="156" y="784" font-size="118" style="letter-spacing:-4px;fill:\${ORANGE}">keep building.</text>\`;
  pieces['zest-quote-mission-3x2'] = poster('zest-quote-mission', '@ZESTPROTOCOL', '', content);
}

for (const [name, svg] of Object.entries(pieces))`);
fs.writeFileSync(p, s);

// update scripts
for (const f of ['examples/zest/preview-all.ps1', 'examples/zest/render-all.ps1']) {
  let t = fs.readFileSync(f, 'utf8');
  t = t.replace("'zest-clmm-3x2')", "'zest-clmm-3x2','zest-quote-vault-3x2','zest-quote-mission-3x2')");
  fs.writeFileSync(f, t);
}
