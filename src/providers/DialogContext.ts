import { createContext } from 'react';

export interface DialogContextValue {
  /** Shows the success dialog; resolves once it is dismissed (auto after 3s, or by the user). */
  showSuccess: (message: string) => Promise<void>;
  /** Shows the error dialog; resolves once it is dismissed (auto after 3s, or by the user). */
  showError: (message: string) => Promise<void>;
  /**
   * Asks the user to confirm an action. Never auto-dismisses. Resolves `true` only if the user chose
   * `confirmLabel`; Cancel, Esc and clicking outside resolve `false`.
   */
  showConfirm: (message: string, confirmLabel: string) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
