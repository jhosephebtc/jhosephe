import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = await readFile(resolve(root, 'SKILL.md'), 'utf8');
const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
const failures = [];
if (!frontmatter) failures.push('SKILL.md precisa de frontmatter YAML.');
else {
  if (!/^name:\s*jhosephe\s*$/m.test(frontmatter[1])) failures.push('Nome da skill inválido.');
  if (!/^description:\s*\S.+$/m.test(frontmatter[1])) failures.push('Descrição ausente.');
}
for (const match of skill.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  const target = match[1].split('#')[0];
  if (!target || /^(https?:|mailto:)/.test(target)) continue;
  try { await stat(resolve(root, target)); } catch { failures.push(`Referência ausente: ${target}`); }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('Skill válida: frontmatter e referências locais presentes.');
