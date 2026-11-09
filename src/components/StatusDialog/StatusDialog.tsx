import { useEffect, useId, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { Logo } from '../Logo/Logo';
import styles from './StatusDialog.module.css';
import { t } from '@/lib/i18n';

export type StatusDialogKind = 'success' | 'error' | 'confirm';

interface StatusDialogProps {
  open: boolean;
  kind: StatusDialogKind;
  message: string;
  /** Label of the confirm button (confirm dialogs only). */
  confirmLabel?: string;
  /** Dismiss: OK on success/error; Cancel, Esc or a backdrop click on all kinds. */
  onClose: () => void;
  /** Accept a confirm dialog. */
  onConfirm?: () => void;
}

const ICONS = {
  success: 'check_circle_outline_rounded',
  error: 'error_outline_rounded',
  confirm: 'help_outline_rounded',
} as const;

/**
 * The app's custom dialog: primary-blue rounded box, logo, an icon and a bold message.
 * Built on the native `<dialog>` so focus is trapped and Esc closes it.
 */
export function StatusDialog({
  open,
  kind,
  message,
  confirmLabel,
  onClose,
  onConfirm,
}: StatusDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      role={kind === 'success' ? 'dialog' : 'alertdialog'}
      aria-labelledby={messageId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the ::backdrop targets the dialog element itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.content}>
        <Logo size="sm" />
        <Icon name={ICONS[kind]} className={[styles.icon, styles[kind]].join(' ')} />
        <p id={messageId} className={styles.message}>
          {message}
        </p>
        {kind === 'confirm' ? (
          <div className={styles.actions}>
            {/* Cancel first and focused by default, so Enter never confirms by accident. */}
            <button type="button" className={styles.secondary} onClick={onClose} autoFocus>
              {t('Cancel')}
            </button>
            <button type="button" className={styles.close} onClick={onConfirm}>
              {confirmLabel ?? 'OK'}
            </button>
          </div>
        ) : (
          <button type="button" className={styles.close} onClick={onClose}>
            {t('OK')}
          </button>
        )}
      </div>
    </dialog>
  );
}
