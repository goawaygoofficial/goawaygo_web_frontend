import { useContext } from 'react';
import { DialogContext } from './DialogContext';
import type { DialogContextValue } from './DialogContext';

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used inside <DialogProvider>.');
  return context;
}
