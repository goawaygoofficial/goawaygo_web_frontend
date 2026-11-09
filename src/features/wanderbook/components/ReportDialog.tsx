import { Button } from '@/components';
import { useEffect, useRef, useState } from 'react';
import { toErrorMessage } from '@/lib/apiClient';
import { report } from '../services/wanderbookService';
import { REPORT_REASONS } from '../types';
import type { ReportReason, ReportTarget } from '../types';
import styles from './ReportDialog.module.css';
import shared from './Wanderbook.module.css';
import { t } from '@/lib/i18n';

interface ReportDialogProps {
  /** What is reported, or null when the dialog is closed. */
  target: { type: ReportTarget; id: string; label: string } | null;
  onClose: () => void;
}

/** Report a post, comment or person: pick a reason, add details if you like. The team reviews every report. */
export function ReportDialog({ target, onClose }: ReportDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'editing' | 'sending' | 'sent'>('editing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (target && !element.open) element.showModal();
    if (!target && element.open) element.close();
  }, [target]);

  const close = () => {
    setReason(null);
    setDetails('');
    setState('editing');
    setError(null);
    onClose();
  };

  return (
    <dialog ref={dialog} className={styles.dialog} onClose={close} aria-labelledby="report-title">
      {target && state === 'sent' && (
        <div className={styles.body}>
          <h2 id="report-title" className={styles.title}>
            {t('Thanks for telling us')}
          </h2>
          <p>
            {t("Our team will review it. You can also block the person so you don't see them.")}
          </p>
          <Button type="button" size="sm" onClick={close}>
            {t('Done')}
          </Button>
        </div>
      )}
      {target && state !== 'sent' && (
        <form
          className={styles.body}
          onSubmit={(event) => {
            event.preventDefault();
            if (!reason) return;
            setState('sending');
            setError(null);
            report({ targetType: target.type, target: target.id, reason, details: details.trim() })
              .then(() => {
                setState('sent');
              })
              .catch((cause: unknown) => {
                setError(toErrorMessage(cause));
                setState('editing');
              });
          }}
        >
          <h2 id="report-title" className={styles.title}>
            {t('Report {0}', t(target.label))}
          </h2>
          <fieldset className={styles.reasons}>
            <legend className={shared.fieldLabel}>{t('Why are you reporting it?')}</legend>
            {REPORT_REASONS.map((option) => (
              <label key={option.id} className={styles.reason}>
                <input
                  type="radio"
                  name="reason"
                  value={option.id}
                  checked={reason === option.id}
                  onChange={() => {
                    setReason(option.id);
                  }}
                />
                {t(option.label)}
              </label>
            ))}
          </fieldset>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>{t('Details (optional)')}</span>
            <textarea
              maxLength={500}
              value={details}
              onChange={(event) => {
                setDetails(event.target.value);
              }}
            />
          </label>
          {error && <p className={shared.error}>{error}</p>}
          <div className={styles.buttons}>
            <Button type="button" variant="outline" size="sm" onClick={close}>
              {t('Cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={!reason || state === 'sending'}>
              {state === 'sending' ? t('Sending…') : t('Send report')}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
