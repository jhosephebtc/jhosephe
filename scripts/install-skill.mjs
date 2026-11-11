import { cp, mkdir, lstat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const index = process.argv.indexOf('--dest');
if (index < 0 || !process.argv[index + 1]) {
  console.error('Informe um destino explícito: node scripts/install-skill.mjs --dest /caminho/skills/jhosephe');
  process.exit(1);
}
const destination = resolve(process.argv[index + 1]);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  await lstat(destination);
  console.error('O destino já existe; nenhuma alteração foi feita.');
  process.exit(1);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await mkdir(destination, { recursive: false });
for (const entry of ['SKILL.md', 'agents', 'references', 'assets']) {
  await cp(resolve(root, entry), resolve(destination, entry), { recursive: true, errorOnExist: true });
}
console.log(`Skill instalada em ${destination}`);
