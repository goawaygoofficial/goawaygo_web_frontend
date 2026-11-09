import type { ReactNode } from 'react';
import styles from './EditableField.module.css';

interface EditableFieldProps {
  label: string;
  value: string;
  /** Masks the value (e.g. password). */
  isSecret?: boolean;
  /** Shown under the row (e.g. a new email waiting for its link). */
  note?: string;
  open?: boolean;
  /** Absent: the row can't be changed here. */
  onToggle?: () => void;
  editLabel?: string;
  /** The form shown under the row while it is open. */
  children?: ReactNode;
}

/** An orange User Profile row (label left, value right) with an Edit button that opens its form underneath. */
export function EditableField({
  label,
  value,
  isSecret = false,
  note,
  open = false,
  onToggle,
  editLabel = 'Edit',
  children,
}: EditableFieldProps) {
  return (
    <div className={styles.item}>
      <dl className={styles.row}>
        <dt className={styles.label}>{label}</dt>
        <dd className={styles.value}>
          {isSecret ? (
            <>
              <span aria-hidden="true">{value}</span>
              <span className="visually-hidden">Hidden</span>
            </>
          ) : (
            <span className={styles.text}>{value}</span>
          )}
          {onToggle && (
            <button
              type="button"
              className={styles.edit}
              aria-expanded={open}
              aria-label={open ? `Cancel changing ${label}` : `${editLabel} ${label}`}
              onClick={onToggle}
            >
              {open ? 'Cancel' : editLabel}
            </button>
          )}
        </dd>
      </dl>
      {note && <p className={styles.note}>{note}</p>}
      {open && <div className={styles.editor}>{children}</div>}
    </div>
  );
}
