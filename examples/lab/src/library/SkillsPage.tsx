import { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, Copy, Download, FileCode2, FileText, Terminal } from 'lucide-react';
import { Button } from '../../../../assets/ui/button';
import { SmoothShape } from '../../../../assets/ui/smooth-shape';

interface SkillFile {
  path: string;
  bytes: number;
  rawUrl: string;
  content: string;
}

interface SkillEntry {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  bundleFile: string;
  bundleUrl: string;
  bundleBytes: number;
  skillMdUrl: string;
  installPath: string;
  entryFile: string;
  highlights: string[];
  files: SkillFile[];
}

interface SkillsManifest {
  generatedAt: string;
  allBundleUrl: string;
  allBundleBytes: number;
  skills: SkillEntry[];
}

const iconProps = { size: 15, strokeWidth: 1.6, 'aria-hidden': true } as const;

const formatBytes = (bytes: number) =>
  bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;

function SkillCopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2600);
  };

  return (
    <div className="library-copy-wrap">
      <button type="button" className="library-copy" onClick={copy} aria-label={label}>
        {status === 'ok' ? <Check {...iconProps} /> : <Copy {...iconProps} />}
        <span>{status === 'ok' ? 'Copied' : label}</span>
      </button>
      <span className="library-sr" role="status">{status === 'ok' ? 'Copied to clipboard.' : ''}</span>
      {status === 'error' && (
        <span className="library-copy-error" role="alert">Couldn’t copy. Select the text manually.</span>
      )}
    </div>
  );
}

export function SkillsPage() {
  const [manifest, setManifest] = useState<SkillsManifest | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [activeSkillId, setActiveSkillId] = useState<string>('jhosephe');
  const [activeFilePath, setActiveFilePath] = useState<string>('SKILL.md');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const abort = new AbortController();
    setError(false);
    fetch('/skills/skills.json', { signal: abort.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Skills manifest unavailable');
        return res.json();
      })
      .then((data: SkillsManifest) => {
        setManifest(data);
        if (data.skills.length && !data.skills.some((s) => s.id === activeSkillId)) {
          setActiveSkillId(data.skills[0].id);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(true);
      });
    return () => abort.abort();
  }, [retry]);

  const activeSkill = manifest?.skills.find((s) => s.id === activeSkillId) ?? manifest?.skills[0] ?? null;

  useEffect(() => {
    if (!activeSkill) return;
    if (!activeSkill.files.some((f) => f.path === activeFilePath)) {
      setActiveFilePath(activeSkill.files[0]?.path ?? 'SKILL.md');
    }
  }, [activeSkill, activeFilePath]);

  const activeFile = activeSkill?.files.find((f) => f.path === activeFilePath) ?? activeSkill?.files[0] ?? null;
  const skillMdFile = activeSkill?.files.find((f) => f.path === 'SKILL.md') ?? null;

  return (
    <main tabIndex={-1} id="library-main" className="library-main library-skills-page">
      <div className="library-breadcrumb">
        Getting started <ChevronRight size={12} aria-hidden="true" /> Agent skills
      </div>

      <div className="library-page-heading">
        <span className="library-eyebrow">Portable prompt &amp; motion skills</span>
        <h1>
          Agent skills
          <span className="library-heading-count">02</span>
        </h1>
        <p>
          Installable instruction packs for Antigravity, Cursor, Claude Code, and Codex. Inspect every file in full or download clean archives directly.
        </p>
      </div>

      {error ? (
        <div className="library-source-message" role="alert">
          <p>Couldn’t load the published skill files.</p>
          <Button onClick={() => setRetry((n) => n + 1)}>Try again</Button>
        </div>
      ) : !manifest || !activeSkill ? (
        <p className="library-source-message" role="status">Loading skill packages…</p>
      ) : (
        <>
          {/* Combined Bundle Callout */}
          <section className="library-skills-bundle" aria-labelledby="bundle-title">
            <div className="library-skills-bundle__copy">
              <span className="library-step">Complete archive</span>
              <h2 id="bundle-title">All Jhosephe skills</h2>
              <p>
                Drop both <code>jhosephe</code> and <code>jhosephe-svg-motion</code> straight into{' '}
                <code>.agents/skills/</code> for React components, SVG post generation, and 60fps MP4 workflows.
              </p>
            </div>
            <div className="library-skills-bundle__actions">
              <a
                className="jh-button jh-button--glass jh-button--primary library-link-button"
                href={manifest.allBundleUrl}
                download="jhosephe-all-skills.zip"
              >
                <SmoothShape className="jh-button__face" radius={16} />
                <span className="jh-button__content">
                  <Download {...iconProps} /> Download all ({formatBytes(manifest.allBundleBytes)})
                </span>
              </a>
            </div>
          </section>

          {/* Skill Switcher Tabs */}
          <div className="library-skills-tabs-wrap">
            <div role="tablist" aria-label="Published skills" className="library-tabs">
              {manifest.skills.map((skill, idx) => {
                const selected = skill.id === activeSkill.id;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    ref={(el) => { tabRefs.current[idx] = el; }}
                    id={`skill-tab-${skill.id}`}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`skill-panel-${skill.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => {
                      setActiveSkillId(skill.id);
                      setActiveFilePath('SKILL.md');
                    }}
                    onKeyDown={(event) => {
                      const count = manifest.skills.length;
                      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                        event.preventDefault();
                        const nextIdx = event.key === 'ArrowRight' ? (idx + 1) % count : (idx - 1 + count) % count;
                        const target = manifest.skills[nextIdx];
                        setActiveSkillId(target.id);
                        setActiveFilePath('SKILL.md');
                        tabRefs.current[nextIdx]?.focus();
                      } else if (event.key === 'Home') {
                        event.preventDefault();
                        setActiveSkillId(manifest.skills[0].id);
                        setActiveFilePath('SKILL.md');
                        tabRefs.current[0]?.focus();
                      } else if (event.key === 'End') {
                        event.preventDefault();
                        setActiveSkillId(manifest.skills[count - 1].id);
                        setActiveFilePath('SKILL.md');
                        tabRefs.current[count - 1]?.focus();
                      }
                    }}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Skill Detail Panel */}
          <section
            id={`skill-panel-${activeSkill.id}`}
            role="tabpanel"
            aria-labelledby={`skill-tab-${activeSkill.id}`}
            className="library-skills-panel"
          >
            <div className="library-skills-header">
              <div>
                <span className="library-eyebrow">{activeSkill.tagline}</span>
                <h2>{activeSkill.name}</h2>
                <p>{activeSkill.summary}</p>
              </div>
              <div className="library-skills-downloads">
                <a
                  className="jh-button jh-button--glass jh-button--primary library-link-button"
                  href={activeSkill.bundleUrl}
                  download={activeSkill.bundleFile}
                >
                  <SmoothShape className="jh-button__face" radius={16} />
                  <span className="jh-button__content">
                    <Download {...iconProps} /> Download .zip ({formatBytes(activeSkill.bundleBytes)})
                  </span>
                </a>
                <a
                  className="jh-button jh-button--glass jh-button--secondary library-link-button"
                  href={activeSkill.skillMdUrl}
                  download={`${activeSkill.id}-SKILL.md`}
                >
                  <SmoothShape className="jh-button__face" radius={16} />
                  <span className="jh-button__content">
                    <FileText {...iconProps} /> Download SKILL.md
                  </span>
                </a>
              </div>
            </div>

            <ul className="library-skills-highlights">
              {activeSkill.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {/* Quick CLI Install */}
            <div className="library-skills-cli">
              <div className="library-section-label">
                <span>
                  <Terminal {...iconProps} />
                </span>
                <h3>Install into your workspace</h3>
              </div>
              <div className="library-command">
                <code>
                  {`mkdir -p ${activeSkill.installPath} && curl -fsSL ${window.location.origin}${activeSkill.skillMdUrl} -o ${activeSkill.installPath}/SKILL.md`}
                </code>
                <SkillCopyButton
                  value={`mkdir -p ${activeSkill.installPath} && curl -fsSL ${window.location.origin}${activeSkill.skillMdUrl} -o ${activeSkill.installPath}/SKILL.md`}
                  label="Copy command"
                />
              </div>
            </div>

            {/* Interactive File Inspector */}
            <div className="library-skills-viewer">
              <div className="library-skills-viewer__head">
                <div className="library-section-label">
                  <span>{String(activeSkill.files.length).padStart(2, '0')}</span>
                  <h3>Included files</h3>
                </div>
                {skillMdFile && (
                  <SkillCopyButton value={skillMdFile.content} label="Copy SKILL.md" />
                )}
              </div>

              <div className="library-skills-filebar">
                <label className="library-file-select library-skills-file-select-mobile">
                  File
                  <select
                    value={activeFile?.path ?? ''}
                    onChange={(event) => setActiveFilePath(event.target.value)}
                  >
                    {activeSkill.files.map((file) => (
                      <option key={file.path} value={file.path}>
                        {file.path} ({formatBytes(file.bytes)})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="library-filter library-skills-files" role="group" aria-label="Skill files">
                  {activeSkill.files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      aria-pressed={activeFile?.path === file.path}
                      onClick={() => setActiveFilePath(file.path)}
                    >
                      {file.path.endsWith('.mjs') ? <FileCode2 size={13} aria-hidden="true" /> : <FileText size={13} aria-hidden="true" />}
                      <span>{file.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeFile && (
                <div className="library-code-block library-skills-code">
                  <div className="library-code-toolbar">
                    <span>
                      {activeSkill.installPath}/{activeFile.path} · {formatBytes(activeFile.bytes)}
                    </span>
                    <div className="library-skills-toolbar-actions">
                      <a
                        className="library-copy"
                        href={activeFile.rawUrl}
                        download={activeFile.path.split('/').pop() ?? 'file'}
                      >
                        <Download {...iconProps} />
                        <span>Raw</span>
                      </a>
                      <SkillCopyButton value={activeFile.content} label="Copy file" />
                    </div>
                  </div>
                  <pre tabIndex={0} aria-label={`${activeFile.path} contents`}>
                    <code>{activeFile.content}</code>
                  </pre>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
