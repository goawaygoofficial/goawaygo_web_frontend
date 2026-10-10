import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StatusDialog } from '@/components';
import type { StatusDialogKind } from '@/components';
import { DialogContext } from './DialogContext';
import type { DialogContextValue } from './DialogContext';

/** Same as the app's `CustomDialogs`: success/error dialogs dismiss themselves after 3 seconds. */
const AUTO_DISMISS_MS = 3000;

interface ActiveDialog {
  kind: StatusDialogKind;
  message: string;
  confirmLabel?: string;
  /** `true` only when a confirm dialog is accepted. */
  resolve: (confirmed: boolean) => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveDialog | null>(null);
  const activeRef = useRef<ActiveDialog | null>(null);

  const settle = useCallback((confirmed: boolean) => {
    const current = activeRef.current;
    activeRef.current = null;
    setActive(null);
    current?.resolve(confirmed);
  }, []);

  const close = useCallback(() => {
    settle(false);
  }, [settle]);

  const confirm = useCallback(() => {
    settle(true);
  }, [settle]);

  const show = useCallback(
    (kind: StatusDialogKind, message: string, confirmLabel?: string) =>
      new Promise<boolean>((resolve) => {
        // Only one dialog at a time: settle any dialog that is still open (a pending confirm counts as "no").
        activeRef.current?.resolve(false);
        const next = { kind, message, confirmLabel, resolve };
        activeRef.current = next;
        setActive(next);
      }),
    [],
  );

  useEffect(() => {
    // Questions wait for an answer; only success/error messages time out.
    if (!active || active.kind === 'confirm') return;
    const timer = window.setTimeout(close, AUTO_DISMISS_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [active, close]);

  const value = useMemo<DialogContextValue>(
    () => ({
      showSuccess: async (message) => {
        await show('success', message);
      },
      showError: async (message) => {
        await show('error', message);
      },
      showConfirm: (message, confirmLabel) => show('confirm', message, confirmLabel),
    }),
    [show],
  );

  return (
    <DialogContext value={value}>
      {children}
      <StatusDialog
        open={active !== null}
        kind={active?.kind ?? 'success'}
        message={active?.message ?? ''}
        confirmLabel={active?.confirmLabel}
        onClose={close}
        onConfirm={confirm}
      />
    </DialogContext>
  );
}
