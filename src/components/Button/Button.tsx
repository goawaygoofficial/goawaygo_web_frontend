import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'outline' | 'light' | 'google' | 'link' | 'linkAccent';

/** `md`: the app's big pill (forms, main actions); `sm`: compact actions in lists, headers and cards. */
type ButtonSize = 'md' | 'sm';

interface ButtonStyle {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyle) {
  return [
    styles.button,
    styles[variant],
    size === 'sm' && styles.sm,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyle {
  /** Leading decorative icon. */
  icon?: ReactNode;
  loading?: boolean;
}

/** The app's pill button — replaces both Flutter `AuthButton` copies and the per-screen ElevatedButtons. */
export function Button({
  variant,
  size,
  icon,
  loading = false,
  fullWidth,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      <span>{children}</span>
    </button>
  );
}

interface ButtonLinkProps extends Omit<LinkProps, 'className'>, ButtonStyle {
  icon?: ReactNode;
}

/** Looks like a {@link Button} but navigates (a real link, so it can be opened in a new tab). */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  icon,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </Link>
  );
}
