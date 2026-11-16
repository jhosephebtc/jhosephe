import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { deflateRawSync } from 'node:zlib';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Build a standard UTF-8 PKZIP archive in memory using Node's built-in deflate. */
function buildZipBuffer(entries) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.zipPath, 'utf8');
    const raw = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const checksum = crc32(raw);
    const compressed = deflateRawSync(raw, { level: 9 });
    const useDeflate = compressed.length < raw.length;
    const payload = useDeflate ? compressed : raw;
    const method = useDeflate ? 8 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x5421, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    localChunks.push(local, nameBytes, payload);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x5421, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralChunks.push(central, nameBytes);

    offset += local.length + nameBytes.length + payload.length;
  }

  const centralDir = Buffer.concat(centralChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralDir, eocd]);
}

async function collectFiles(baseDir, relPrefix, list = []) {
  const entries = await readdir(baseDir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = resolve(baseDir, entry.name);
    const rel = `${relPrefix}/${entry.name}`;
    if (entry.isDirectory()) {
      await collectFiles(full, rel, list);
    } else if (entry.isFile()) {
      const content = await readFile(full, 'utf8');
      list.push({ path: rel, fullPath: full, content, bytes: Buffer.byteLength(content, 'utf8') });
    }
  }
  return list;
}

async function gatherSkill(root, spec) {
  const files = [];
  for (const item of spec.sources) {
    const abs = resolve(root, item.src);
    if (item.dir) {
      await collectFiles(abs, item.target, files);
    } else {
      const content = await readFile(abs, 'utf8');
      files.push({ path: item.target, fullPath: abs, content, bytes: Buffer.byteLength(content, 'utf8') });
    }
  }
  return {
    id: spec.id,
    name: spec.name,
    tagline: spec.tagline,
    summary: spec.summary,
    bundleFile: `${spec.id}-skill.zip`,
    installPath: `.agents/skills/${spec.id}`,
    entryFile: 'SKILL.md',
    highlights: spec.highlights,
    files: files.map(({ path: p, content, bytes }) => ({
      path: p,
      bytes,
      rawUrl: `/skills/${spec.id}/${p}`,
      content,
    })),
  };
}

export async function buildSkillsPublic(root, publicRoot) {
  const skillsDir = resolve(publicRoot, 'skills');
  await mkdir(skillsDir, { recursive: true });

  const specs = [
    {
      id: 'jhosephe',
      name: 'jhosephe',
      tagline: 'Tactile UI Design System',
      summary:
        'Design, build, and audit monochromatic React 19 + TypeScript tactile interfaces with Light Porcelain & Black Obsidian themes, continuous surface transparency/blur, and 64 registry components.',
      highlights: [
        'Calibrated Light Porcelain (#f8f8f8) & Black Obsidian (#060606) achromatic hierarchy',
        'Continuous transparency (0–85%) and backdrop blur (0–32px) with global portal sync',
        'Confined OKLCH hardware emission & unified .jh-scroll-frame scroll architecture',
        '10 domain references + design-system specification included',
      ],
      sources: [
        { src: 'SKILL.md', target: 'SKILL.md' },
        { src: 'agents/openai.yaml', target: 'agents/openai.yaml' },
        { src: 'references', target: 'references', dir: true },
        { src: 'docs/design-system.md', target: 'docs/design-system.md' },
      ],
    },
    {
      id: 'jhosephe-svg-motion',
      name: 'jhosephe-svg-motion',
      tagline: 'Social Posts, SVG Motion & 60fps Video',
      summary:
        'Generate brand-aligned architectural SVG drafts, animated SVGs, 60fps H.264 MP4 showcases, and structured X/Twitter build threads powered by Jhosephe UI hardware instruments.',
      highlights: [
        'Draft-first workflow: preview static SVGs cleanly before writing motion or video',
        '1:1 native SVG viewBox presets (3:2 1620×1080, 16:9, 1:1, 4:5, 9:16)',
        '<= 0.5s opening frame hook rule + archival paper grain & 3D directional cast shadows',
        'Bundled Chromium + FFmpeg 60fps MP4 exporter script with auto @font-face inlining',
      ],
      sources: [
        { src: '.agents/skills/jhosephe-svg-motion/SKILL.md', target: 'SKILL.md' },
        { src: '.agents/skills/jhosephe-svg-motion/references', target: 'references', dir: true },
        { src: '.agents/skills/jhosephe-svg-motion/scripts', target: 'scripts', dir: true },
      ],
    },
  ];

  const publishedSkills = [];
  const combinedZipEntries = [];

  for (const spec of specs) {
    const skill = await gatherSkill(root, spec);
    const skillZipEntries = [];

    for (const file of skill.files) {
      const destFile = resolve(skillsDir, spec.id, file.path);
      await mkdir(dirname(destFile), { recursive: true });
      await writeFile(destFile, file.content, 'utf8');
      skillZipEntries.push({ zipPath: `${spec.id}/${file.path}`, data: file.content });
      combinedZipEntries.push({ zipPath: `${spec.id}/${file.path}`, data: file.content });
    }

    const zipBuf = buildZipBuffer(skillZipEntries);
    await writeFile(resolve(skillsDir, skill.bundleFile), zipBuf);

    publishedSkills.push({
      ...skill,
      bundleBytes: zipBuf.length,
      bundleUrl: `/skills/${skill.bundleFile}`,
      skillMdUrl: `/skills/${spec.id}/SKILL.md`,
    });
  }

  const allBundleBuf = buildZipBuffer(combinedZipEntries);
  await writeFile(resolve(skillsDir, 'jhosephe-all-skills.zip'), allBundleBuf);

  const manifest = {
    generatedAt: new Date().toISOString(),
    allBundleUrl: '/skills/jhosephe-all-skills.zip',
    allBundleBytes: allBundleBuf.length,
    skills: publishedSkills,
  };

  await writeFile(resolve(skillsDir, 'skills.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(
    `Skills publicadas em ${relative(root, skillsDir)}: ${publishedSkills.map((s) => `${s.id} (${s.files.length} arquivos, ${(s.bundleBytes / 1024).toFixed(1)} KB)`).join(', ')}`,
  );
}
