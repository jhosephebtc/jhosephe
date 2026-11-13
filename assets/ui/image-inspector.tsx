import { useId, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface ImageInspectorData {
  id?: string;
  src?: string;
  alt?: string;
  title?: string;
  timestamp?: string;
  location?: string;
  frameNumber?: string | number;
  credentialsStatus?: string;
  credentialsNote?: string;
  camera?: string;
  firmware?: string;
  format?: string;
  aspectRatio?: string;
  focalLength?: string;
  iso?: string | number;
  shutter?: string;
  ev?: string;
  scene?: 'koi-bridge' | 'cedar-mist' | 'pavilion';
}

export interface ImageInspectorProps {
  label?: string;
  data?: ImageInspectorData;
  onFileInspect?: (file: File, meta: { width: number; height: number; format: string }) => void;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}

const SPECIMENS: Required<Omit<ImageInspectorData, 'src' | 'alt'>>[] = [
  {
    id: '132',
    title: 'Koi pond beneath stone bridge, Taito City',
    timestamp: 'May 1, 15:10',
    location: 'Taito City · Tokyo',
    frameNumber: '132',
    credentialsStatus: 'Trusted',
    credentialsNote: 'This picture contains valid content credentials from a trusted source.',
    camera: 'Vwfndr MBL Android',
    firmware: '1.0.0-rc.3',
    format: 'Vwfndr™ JPEG',
    aspectRatio: '2:3',
    focalLength: '24mm',
    iso: '50',
    shutter: '1/294s',
    ev: 'EV 0',
    scene: 'koi-bridge',
  },
  {
    id: '048',
    title: 'Cedar path under early drizzle, Kyoto',
    timestamp: 'Oct 14, 07:42',
    location: 'Sakyo Ward · Kyoto',
    frameNumber: '048',
    credentialsStatus: 'Trusted',
    credentialsNote: 'Hardware attestation signature verified inside local C2PA manifest.',
    camera: 'Sigma BF Silver',
    firmware: '2.1.0-pro',
    format: 'DNG · 14-bit',
    aspectRatio: '3:2',
    focalLength: '45mm',
    iso: '200',
    shutter: '1/125s',
    ev: 'EV -⅓',
    scene: 'cedar-mist',
  },
  {
    id: '089',
    title: 'Concrete pavilion atrium light study',
    timestamp: 'Nov 03, 16:18',
    location: 'Aoyama · Tokyo',
    frameNumber: '089',
    credentialsStatus: 'Trusted',
    credentialsNote: 'Origin hash matches sealed sensor raw digest.',
    camera: 'GF670 Folding 120',
    firmware: 'Mechanical',
    format: 'Pan 400 scan',
    aspectRatio: '6:7',
    focalLength: '80mm',
    iso: '400',
    shutter: '1/60s',
    ev: 'EV +⅔',
    scene: 'pavilion',
  },
];

function PhotoSpecimen({ src, alt, scene }: { src?: string; alt: string; scene?: ImageInspectorData['scene'] }) {
  if (src) {
    return <img src={src} alt={alt} className="jh-image-inspector__img" />;
  }
  if (scene === 'cedar-mist') {
    return (
      <svg viewBox="0 0 300 380" className="jh-image-inspector__img" aria-label={alt}>
        <defs>
          <linearGradient id="jh-ii-cedar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcdcdc" />
            <stop offset="60%" stopColor="#6a6a6a" />
            <stop offset="100%" stopColor="#181818" />
          </linearGradient>
        </defs>
        <rect width="300" height="380" fill="url(#jh-ii-cedar)" />
        <g fill="#262626">
          <rect x="34" y="0" width="22" height="380" />
          <rect x="98" y="0" width="30" height="380" />
          <rect x="212" y="0" width="26" height="380" />
          <rect x="262" y="0" width="16" height="380" />
        </g>
        <path d="M126 380 L152 190 L166 190 L198 380 Z" fill="#888888" opacity="0.7" />
        <ellipse cx="150" cy="120" rx="140" ry="60" fill="#f0f0f0" opacity="0.22" />
      </svg>
    );
  }
  if (scene === 'pavilion') {
    return (
      <svg viewBox="0 0 300 380" className="jh-image-inspector__img" aria-label={alt}>
        <rect width="300" height="380" fill="#d4d4d4" />
        <polygon points="0,0 175,0 120,380 0,380" fill="#2c2c2c" />
        <polygon points="175,0 300,90 300,380 120,380" fill="#e8e8e8" />
        <polygon points="175,0 300,0 300,90" fill="#8c8c8c" />
        <line x1="120" y1="220" x2="300" y2="265" stroke="#222222" strokeWidth="1.5" opacity="0.32" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 380" className="jh-image-inspector__img" aria-label={alt}>
      <defs>
        <linearGradient id="jh-ii-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#262626" />
          <stop offset="55%" stopColor="#141414" />
          <stop offset="100%" stopColor="#0e0e0e" />
        </linearGradient>
        <linearGradient id="jh-ii-canopy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bcbcbc" />
          <stop offset="65%" stopColor="#6a6a6a" />
          <stop offset="100%" stopColor="#2c2c2c" />
        </linearGradient>
      </defs>
      <rect width="300" height="150" fill="url(#jh-ii-canopy)" />
      <rect y="140" width="300" height="240" fill="url(#jh-ii-water)" />
      {/* Stone foliage banks */}
      <path d="M0 110 Q56 130 48 380 L0 380 Z" fill="#525252" />
      <path d="M300 104 Q248 138 258 380 L300 380 Z" fill="#3a3a3a" />
      {/* Arched stone bridge */}
      <path d="M26 118 Q150 90 274 118 L274 166 Q150 132 26 166 Z" fill="#5a5a5a" />
      <path d="M26 118 Q150 90 274 118" fill="none" stroke="#a6a6a6" strokeWidth="4" />
      <rect x="64" y="88" width="12" height="32" rx="3" fill="#707070" />
      <rect x="142" y="74" width="14" height="36" rx="4" fill="#7c7c7c" />
      <rect x="224" y="90" width="12" height="30" rx="3" fill="#686868" />
      {/* Water reflection ripples */}
      <ellipse cx="150" cy="242" rx="64" ry="72" fill="#e0e0e0" opacity="0.1" />
      {/* Monochrome silver-gelatin koi studies */}
      <ellipse cx="118" cy="246" rx="14" ry="5" transform="rotate(-22 118 246)" fill="#d6d6d6" />
      <ellipse cx="122" cy="248" rx="6" ry="3.5" transform="rotate(-22 122 248)" fill="#f5f5f5" />
      <ellipse cx="156" cy="230" rx="16" ry="5.5" transform="rotate(14 156 230)" fill="#ececec" />
      <ellipse cx="158" cy="230" rx="7" ry="4" transform="rotate(14 158 230)" fill="#8c8c8c" />
      <ellipse cx="144" cy="284" rx="17" ry="6" transform="rotate(38 144 284)" fill="#cfcfcf" />
      <ellipse cx="102" cy="340" rx="15" ry="5" transform="rotate(-35 102 340)" fill="#f2f2f2" />
      <ellipse cx="104" cy="342" rx="7" ry="4" transform="rotate(-35 104 342)" fill="#7a7a7a" />
      <ellipse cx="182" cy="264" rx="13" ry="4.5" transform="rotate(-12 182 264)" fill="#e2e2e2" />
    </svg>
  );
}

export function ImageInspector({
  label = 'Photo credentials inspector',
  data,
  onFileInspect,
  material,
  className,
  style,
}: ImageInspectorProps) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [specimenIndex, setSpecimenIndex] = useState(0);
  const [uploaded, setUploaded] = useState<ImageInspectorData | null>(null);

  const activeData: ImageInspectorData = uploaded ?? data ?? SPECIMENS[specimenIndex];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      const format = (file.type.split('/')[1] || 'IMAGE').toUpperCase();
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const d = gcd(probe.naturalWidth || 1, probe.naturalHeight || 1);
      const ratio = `${Math.round(probe.naturalWidth / d)}:${Math.round(probe.naturalHeight / d)}`;
      setUploaded({
        src: objectUrl,
        alt: file.name,
        title: file.name,
        timestamp: new Date(file.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        location: `${probe.naturalWidth} × ${probe.naturalHeight}`,
        frameNumber: 'Local',
        credentialsStatus: 'Verified local',
        credentialsNote: `Loaded ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB) locally inside browser memory.`,
        camera: 'Local upload specimen',
        firmware: file.type || 'image/*',
        format: `${format} · ${probe.naturalWidth}×${probe.naturalHeight}`,
        aspectRatio: ratio,
        focalLength: '—',
        iso: 'Auto',
        shutter: '—',
        ev: 'EV 0',
      });
      onFileInspect?.(file, { width: probe.naturalWidth, height: probe.naturalHeight, format });
    };
    probe.src = objectUrl;
  };

  return (
    <section
      className={cn('jh-image-inspector', className)}
      data-jh-material={material ? surfaceMaterialAttr(material) : undefined}
      style={style}
      aria-labelledby={titleId}
    >
      <div className="jh-image-inspector__left">
        <div className="jh-image-inspector__topbar">
          <span>{activeData.timestamp ?? 'May 1, 15:10'}</span>
          <button
            type="button"
            className="jh-image-inspector__cycle"
            onClick={() => {
              setUploaded(null);
              setSpecimenIndex(i => (i + 1) % SPECIMENS.length);
            }}
            title="Cycle sample plate"
          >
            {activeData.location ?? 'Taito City · Tokyo'} ↗
          </button>
        </div>

        <div className="jh-image-inspector__well">
          <PhotoSpecimen
            src={activeData.src}
            alt={activeData.alt ?? activeData.title ?? 'Inspected specimen photograph'}
            scene={activeData.scene}
          />
        </div>

        <div className="jh-image-inspector__exifbar">
          <span>{activeData.aspectRatio ?? '2:3'}</span>
          <span>{activeData.focalLength ?? '24mm'}</span>
          <span>ISO {activeData.iso ?? '50'}</span>
          <span>{activeData.shutter ?? '1/294s'}</span>
          <span>{activeData.ev ?? 'EV 0'}</span>
        </div>
      </div>

      <div className="jh-image-inspector__right">
        <div className="jh-image-inspector__head-grid">
          <div className="jh-image-inspector__eyebrow" id={titleId}>Photo specimen</div>
          <div className="jh-image-inspector__frame-row">
            <div className="jh-image-inspector__frame-id">{activeData.frameNumber ?? '132'}</div>
            <div className="jh-image-inspector__plate-index" aria-hidden="true">
              {String(specimenIndex + 1).padStart(2, '0')} / {String(SPECIMENS.length).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="jh-image-inspector__rows">
          <div className="jh-image-inspector__row">
            <span className="jh-image-inspector__key">Content credentials</span>
            <div className="jh-image-inspector__val">
              <strong className="jh-image-inspector__status">{activeData.credentialsStatus ?? 'Trusted'}</strong>
              <p>{activeData.credentialsNote ?? 'This picture contains valid content credentials from a trusted source.'}</p>
            </div>
          </div>

          <div className="jh-image-inspector__row">
            <span className="jh-image-inspector__key">Camera</span>
            <div className="jh-image-inspector__val">
              <strong>{activeData.camera ?? 'Vwfndr MBL Android'}</strong>
              <span className="jh-image-inspector__sub">{activeData.firmware ?? '1.0.0-rc.3'}</span>
            </div>
          </div>

          <div className="jh-image-inspector__row">
            <span className="jh-image-inspector__key">Format</span>
            <div className="jh-image-inspector__val">
              <strong>{activeData.format ?? 'Vwfndr™ JPEG'}</strong>
            </div>
          </div>
        </div>

        <div className="jh-image-inspector__footer">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="jh-image-inspector__file"
            onChange={handleFileChange}
            aria-label="Upload image to inspect"
          />
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="jh-image-inspector__verify-btn"
            onClick={() => fileRef.current?.click()}
          >
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            Verify another image
          </Button>
          <p className="jh-image-inspector__footnote">
            Content is verified locally on your device.
          </p>
        </div>
      </div>
    </section>
  );
}
