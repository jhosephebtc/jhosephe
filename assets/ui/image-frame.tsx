import type { CSSProperties, ReactNode } from 'react';

/** A responsive, accessible glass frame for a supplied image or custom artwork. */
export function ImageFrame({ src, alt, caption, ratio = '16 / 10', fit = 'cover', children, className }: {
  src?: string; alt: string; caption?: string; ratio?: string; fit?: 'cover' | 'contain'; children?: ReactNode; className?: string;
}) {
  const style = { aspectRatio: ratio } as CSSProperties;
  return <figure className={['jh-image-frame', className].filter(Boolean).join(' ')}>
    <div className="jh-image-frame__viewport" style={style}>
      {src ? <img src={src} alt={alt} loading="lazy" decoding="async" style={{ objectFit: fit }} /> : children
        ? <div className="jh-image-frame__art" role="img" aria-label={alt}>{children}</div>
        : <div className="jh-image-frame__empty" role="img" aria-label={alt}><span className="jh-image-frame__mark" aria-hidden="true" /><span>{alt}</span></div>}
    </div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}
