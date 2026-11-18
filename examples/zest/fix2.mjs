import fs from 'node:fs';
const p = 'examples/zest/generate.mjs';
let s = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) console.log('MISSING', a.slice(0, 70)); s = s.split(a).join(b); };

// ---- theme ----
rep("const INK = '#F6F1EB';", "const LIGHT = process.env.THEME === 'light';\nconst SUF = LIGHT ? '-light' : '';\nconst INK = LIGHT ? '#18191E' : '#F6F1EB';");
rep("const GRAY = '#A19F9A';\nconst CARD = '#0E0E0F';\nconst LINE = '#2B2B30';\nconst TRACK = '#1C1C1F';",
  "const GRAY = LIGHT ? '#5B5D64' : '#A19F9A';\nconst CARD = LIGHT ? '#FFFFFF' : '#0E0E0F';\nconst LINE = LIGHT ? '#EBDDD1' : '#2B2B30';\nconst TRACK = LIGHT ? '#FBEEE3' : '#1C1C1F';\nconst MID1 = LIGHT ? '#C8CBD3' : '#55555C';\nconst MID2 = LIGHT ? '#E3E5EA' : '#34343A';\nconst DASH = LIGHT ? '#9A9CA3' : '#6A6A70';\nconst FOOT = LIGHT ? '#6B6D74' : '#8A8A90';");
rep("const CREAM = '#050505';", "const CREAM = LIGHT ? '#FFF6F0' : '#050505';");
rep("stroke:#6A6A70", "stroke:${DASH}");
rep("'#55555C'", "MID1");
rep("'#34343A'", "MID2");
rep('style="fill:#8A8A90"', 'style="fill:${FOOT}"');
rep('fill-opacity=".9" stroke', 'fill-opacity="${LIGHT ? 0.94 : 0.9}" stroke');
rep("`${name}.svg`", "`${name}${SUF}.svg`");
rep("const fontCss = `", "const fontCss = () => `");
rep("<style>${fontCss}", "<style>${fontCss()}");
// ---- less text ----
// remove right-hand source label in every poster
rep(`<text class="eb" x="1464" y="168" text-anchor="end" style="fill:#9A9CA3;letter-spacing:1.5px;font-size:20px">\${source}</text>`, '');
// hero caption
rep(/<text class="eb" x="810" y="868"[^\n]*\n?/.exec(s)[0], '');
// track
rep('<text class="t" x="156" y="360" font-size="32">The track record behind the capital layer for Bitcoin.</text>\n', '');
rep("['$100M', 'peak TVL', 'Bitcoin lending on Stacks']", "['$100M', 'peak TVL', '']");
rep("['2+', 'years of mainnet', 'lending experience']", "['2+', 'years on mainnet', '']");
rep("['Zero', 'bad debt,', 'no BTC lost']", "['Zero', 'bad debt', '']");
rep('<text class="t" x="${x}" y="676" font-size="30">${col[2]}</text>', '');
rep('y="560" font-size="112"', 'y="580" font-size="120"');
rep('y="632" font-size="36"', 'y="650" font-size="38"');
// q3
rep(/<text class="t" x="156" y="456" font-size="28">Three[^\n]*\n/.exec(s)[0], '');
rep(/<text class="t" x="156" y="770" font-size="28">1,500\+[^\n]*\n/.exec(s)[0], '');
rep('total debt on Sep 30, 2026', 'debt on Sep 30');
// vault
rep(/<text class="t" x="156" y="456" font-size="30">Bitcoin Collateral Vaults[^\n]*\n/.exec(s)[0], '');
rep(/<text class="t" x="340" y="\$\{y \+ 176\}"[^\n]*\n/.exec(s)[0], '');
rep(/<text class="t" x="810" y="\$\{y \+ 176\}"[^\n]*\n/.exec(s)[0], '');
rep(/<text class="t" x="1280" y="\$\{y \+ 176\}"[^\n]*\n/.exec(s)[0], '');
rep('>Self-custodial vault</text>', '>Vault</text>');
rep('>Borrow USDC</text>', '>USDC</text>');
// rates
rep('Rates on the capital layer', 'Zest rates');
rep(/<text class="t" x="156" y="\$\{y \+ 58\}" font-size="22">\$\{row\[1\]\}<\/text>/.exec(s)[0], '');
rep('<text class="eb" x="196" y="810" style="font-size:20px">ZEST PROTOCOL STACKS SUITE</text>', '');
rep('<text class="h" x="196" y="852" font-size="34"', '<text class="h" x="196" y="836" font-size="40"');
rep('$71,215,494 TVL   ·   800.94 BTC', '$71,215,494 TVL  ·  800.94 BTC');
rep('<text class="m" x="156" y="${y + 24}" font-size="34">', '<text class="m" x="156" y="${y + 42}" font-size="38">');
// clmm
rep(/<text class="t" x="156" y="448" font-size="30">Zest Protocol CLMM[^\n]*\n/.exec(s)[0], '');
rep(/<text class="eb" x="\$\{\(x0 \+ 11[^\n]*\n/.exec(s)[0], '');
rep(/<text class="m" x="1100" y="560"[^\n]*\n/.exec(s)[0], '');
rep(/<text class="t" x="1100" y="834"[^\n]*\n/.exec(s)[0], '');
rep('<text class="h" x="1100" y="796" font-size="58" style="fill:${ORANGE}">100k STX</text>', '<text class="h" x="1100" y="810" font-size="58" style="fill:${ORANGE}">100k STX</text>');
fs.writeFileSync(p, s);
