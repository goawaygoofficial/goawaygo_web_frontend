import { useCallback, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import lockIcon from '@/assets/icons/lock.png';
import { Button, TextField } from '@/components';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { PASSWORD_RULE_MESSAGE, REQUIRED_FIELDS_MESSAGE, isStrongPassword } from '@/lib/validation';
import { useDialog } from '@/providers';
import { AuthOverlay } from '../components/AuthOverlay';
import { resetPassword } from '../services/authService';
import styles from '../components/AuthForms.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { showError, showSuccess } = useDialog();
  const navigate = useNavigate();

  const submit = useCallback(async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = newPassword.trim();
    if (trimmedEmail.length === 0 || trimmedPassword.length === 0) {
      await showError(REQUIRED_FIELDS_MESSAGE);
      return;
    }
    if (!isStrongPassword(trimmedPassword)) {
      await showError(PASSWORD_RULE_MESSAGE);
      return;
    }
    try {
      await resetPassword({ email: trimmedEmail, newPassword: trimmedPassword });
      await showSuccess('Verification email sent! Please check your inbox.');
      void navigate(routes.auth, { replace: true });
    } catch (error) {
      await showError(toErrorMessage(error, 'Failed to request password reset'));
    }
  }, [email, newPassword, showError, showSuccess, navigate]);
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
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="New Password..."
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
          }}
        />
        <Button type="submit" fullWidth loading={pending} icon={<img src={lockIcon} alt="" />}>
          RESET PASSWORD
        </Button>
        <Link to={routes.auth} className={styles.accentLink}>
          Back to Sign In
        </Link>
      </form>
    </AuthOverlay>
  );
}
