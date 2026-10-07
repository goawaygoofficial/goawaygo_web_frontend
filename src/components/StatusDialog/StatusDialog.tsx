import { useEffect, useId, useRef } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { Logo } from '../Logo/Logo';
import styles from './StatusDialog.module.css';

export type StatusDialogKind = 'success' | 'error';

interface StatusDialogProps {
  open: boolean;
  kind: StatusDialogKind;
  message: string;
  onClose: () => void;
}

/**
 * The app's custom dialog: primary-blue rounded box, logo, a success/error icon and a bold message.
 * Built on the native `<dialog>` so focus is trapped and Esc closes it.
 */
export function StatusDialog({ open, kind, message, onClose }: StatusDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const Icon = kind === 'success' ? CircleCheck : CircleAlert;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      role={kind === 'error' ? 'alertdialog' : 'dialog'}
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
        <Icon className={[styles.icon, styles[kind]].join(' ')} aria-hidden="true" />
        <p id={messageId} className={styles.message}>
          {message}
        </p>
        <button type="button" className={styles.close} onClick={onClose}>
          OK
        </button>
      </div>
    </dialog>
  );
}
