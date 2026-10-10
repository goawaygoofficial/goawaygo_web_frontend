import { LogOut } from 'lucide-react';
import { useSignOut } from '../hooks/useSignOut';
import styles from './SignOutIconButton.module.css';

/** Round header icon (same size and style as the notification bell) that signs out after a confirmation. */
export function SignOutIconButton() {
  const { signOut, pending } = useSignOut();
  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Sign out"
      title="Sign out"
      disabled={pending}
      onClick={signOut}
    >
      <LogOut aria-hidden="true" />
    </button>
  );
}
