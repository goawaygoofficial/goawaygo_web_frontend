import logoUrl from '@/assets/images/logo.png';
import styles from './Logo.module.css';

type LogoSize = 'sm' | 'md' | 'lg' | 'splash';

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="Goaway"
      className={[styles.logo, styles[size], className].filter(Boolean).join(' ')}
    />
  );
}
