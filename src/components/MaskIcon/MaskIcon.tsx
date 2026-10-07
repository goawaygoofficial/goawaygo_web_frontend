import type { CSSProperties } from 'react';
import styles from './MaskIcon.module.css';

interface MaskIconProps {
  /** URL of a single-colour PNG. It is painted with the current text colour. */
  src: string;
  className?: string;
}

/** Renders a monochrome image asset tinted with `currentColor` (like Flutter's `Image.asset(color:)`). */
export function MaskIcon({ src, className }: MaskIconProps) {
  const style = { '--mask-icon-src': `url("${src}")` } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      className={[styles.icon, className].filter(Boolean).join(' ')}
      style={style}
    />
  );
}
