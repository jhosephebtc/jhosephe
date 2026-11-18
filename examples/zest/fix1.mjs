import fs from 'node:fs';
const p = 'examples/zest/generate.mjs';
let s = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) console.log('MISSING', a.slice(0, 60)); s = s.split(a).join(b); };

// track: smaller numerals + fire tile
rep('font-size="150">${col[0]}', 'font-size="112">${col[0]}');
rep('<text class="h" x="156" y="300" font-size="92">Proofs, not promises.</text>', '${fireTile(1190, 210, 274, 170, -1)}\n<text class="h" x="156" y="300" font-size="92">Proofs, not promises.</text>');
// q3
rep('About three quarters came from net new borrowing.', 'Three quarters came from net new borrowing.');
rep('<text class="t" x="156" y="456" font-size="30">Three', '${fireTile(1010, 210, 454, 150, -3)}\n<text class="t" x="156" y="456" font-size="28">Three');
rep('<rect class="scan" x="780" y="400" width="3" height="${base0 - 400}" fill="${ORANGE}" opacity=".7"/>', '');
// vault
rep('<text class="h" x="156" y="300" font-size="84">Deposit native BTC.</text>', '${fireTile(1200, 220, 264, 250, -2)}\n<text class="h" x="156" y="300" font-size="84">Deposit native BTC.</text>');
// clmm
rep('<text class="h" x="156" y="300" font-size="84">Concentrated liquidity</text>', '${fireTile(1110, 210, 354, 215, -4)}\n<text class="h" x="156" y="300" font-size="84">Concentrated liquidity</text>');
// rates
rep('"variable rate"', '"on Stacks"');
rep("'variable rate'", "'on Stacks'");
rep('<rect x="156" y="780" width="1308" height="86" fill="${TRACK}" rx="22"/>', '<rect x="156" y="772" width="1308" height="100" fill="${TRACK}" rx="26"/>');
rep('<text class="eb" x="188" y="816" style="font-size:20px">ZEST PROTOCOL STACKS SUITE</text>', '<text class="eb" x="196" y="810" style="font-size:20px">ZEST PROTOCOL STACKS SUITE</text>');
rep('<text class="h" x="188" y="852" font-size="34"', '<text class="h" x="196" y="852" font-size="34"');
rep('<rect class="sc2" x="156" y="780" width="6" height="86" fill="${ORANGE}"/>', '');
fs.writeFileSync(p, s);
