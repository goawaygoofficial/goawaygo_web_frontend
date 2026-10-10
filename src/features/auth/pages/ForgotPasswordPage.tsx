import { useCallback, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import lockIcon from '@/assets/icons/lock.png';
import { Button, TextField } from '@/components';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { REQUIRED_FIELDS_MESSAGE } from '@/lib/validation';
import { useDialog } from '@/providers';
import { AuthOverlay } from '../components/AuthOverlay';
import { requestPasswordReset } from '../services/authService';
import styles from '../components/AuthForms.module.css';

/** Same wording whether or not the account exists, so this page can't be used to find out who is registered. */
const RESET_REQUESTED_MESSAGE =
  'If an account exists for that email, we have sent a link to reset your password. Please check your inbox.';

/**
 * Requests a password-reset link. Only the email is collected here; the new password is chosen on the page the
 * emailed link opens, which proves the person owns the email.
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { showError, showSuccess } = useDialog();
  const navigate = useNavigate();

  const submit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      await showError(REQUIRED_FIELDS_MESSAGE);
      return;
    }
    try {
      await requestPasswordReset({ email: trimmedEmail });
      await showSuccess(RESET_REQUESTED_MESSAGE);
      void navigate(routes.auth, { replace: true });
    } catch (error) {
      await showError(toErrorMessage(error, 'Failed to request password reset'));
    }
  }, [email, showError, showSuccess, navigate]);
  const [pending, run] = useAsyncAction(submit);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    run();
  };

  return (
    <AuthOverlay>
      <h1 className={styles.heading}>Forgot Password?</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label="Registered email"
          type="email"
          autoComplete="email"
          placeholder="Enter your registered email..."
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <Button type="submit" fullWidth loading={pending} icon={<img src={lockIcon} alt="" />}>
          SEND RESET LINK
        </Button>
        <Link to={routes.auth} className={styles.accentLink}>
          Back to Sign In
        </Link>
      </form>
    </AuthOverlay>
  );
}
