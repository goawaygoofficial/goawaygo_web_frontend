import { createContext } from 'react';

export interface DialogContextValue {
  /** Shows the success dialog; resolves once it is dismissed (auto after 3s, or by the user). */
  showSuccess: (message: string) => Promise<void>;
  /** Shows the error dialog; resolves once it is dismissed (auto after 3s, or by the user). */
  showError: (message: string) => Promise<void>;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
