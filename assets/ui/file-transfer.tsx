import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from './button';
import { ProgressBar } from './progress-bar';

export function FileTransfer({ label = 'File transfer', onFilesSelected }: {
  label?: string; onFilesSelected?: (files: File[]) => void;
}) {
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState<number | undefined>(0);
  const [status, setStatus] = useState('Choose a file to prepare it in this browser.');
  const reader = useRef<FileReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => reader.current?.abort(), []);

  const prepareFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    reader.current?.abort();
    setFileName(file.name);
    setProgress(0);
    setStatus('Reading the file locally');
    onFilesSelected?.([file]);
    const nextReader = new FileReader();
    reader.current = nextReader;
    nextReader.onprogress = progressEvent => {
      if (progressEvent.lengthComputable) setProgress((progressEvent.loaded / progressEvent.total) * 100);
    };
    nextReader.onload = () => { setProgress(100); setStatus('File ready in this browser'); };
    nextReader.onerror = () => { setProgress(undefined); setStatus('This file could not be read'); };
    nextReader.readAsArrayBuffer(file);
    event.currentTarget.value = '';
  };

  const downloadSample = () => {
    const blob = new Blob(['name,value\nIntensity,64\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'jhosephe-sample.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Sample download started');
  };

  return <section className="jh-file-transfer" aria-label={label}>
    <div className="jh-file-transfer__actions">
      <input ref={fileInputRef} type="file" className="jh-visually-hidden" tabIndex={-1} aria-hidden="true" onChange={prepareFile} />
      <Button type="button" size="small" variant="secondary" onClick={() => fileInputRef.current?.click()}>Upload files</Button>
      <Button type="button" size="small" variant="secondary" onClick={downloadSample}>Download sample</Button>
    </div>
    {fileName && <p className="jh-file-transfer__filename" title={fileName}>{fileName}</p>}
    <div className="jh-file-transfer__progress"><ProgressBar label="Local file preparation" value={progress} /><output>{progress === undefined ? '—' : `${Math.round(progress)}%`}</output></div>
    <p className="jh-file-transfer__status" role="status">{status}</p>
    <p className="jh-file-transfer__note">Demo only. Files are not sent to a server.</p>
  </section>;
}
