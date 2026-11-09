import { useCallback, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import lockIcon from '@/assets/icons/lock.png';
import { Button, TextField } from '@/components';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { PASSWORD_RULE_MESSAGE, REQUIRED_FIELDS_MESSAGE, isStrongPassword } from '@/lib/validation';
import { useDialog, useUser } from '@/providers';
import { AuthOverlay } from '../components/AuthOverlay';
import { useLinkToken } from '../hooks/useLinkToken';
import { resetPassword } from '../services/authService';
import styles from '../components/AuthForms.module.css';
import { t } from '@/lib/i18n';

const PASSWORD_CHANGED_MESSAGE =
  'Your password has been changed. Please sign in with your new password.';

/** Opened from the "Reset your GoAwayGo password" email: `/reset-password?token=…`. */
export function ResetPasswordPage() {
  const token = useLinkToken();
  return token ? <ResetPasswordForm token={token} /> : <MissingTokenNotice />;
}

function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const { user, signOut } = useUser();
  const { showError, showSuccess } = useDialog();
  const navigate = useNavigate();

  const submit = useCallback(async () => {
    if (password.length === 0 || confirmation.length === 0) {
      await showError(REQUIRED_FIELDS_MESSAGE);
      return;
    }
    if (!isStrongPassword(password)) {
      await showError(PASSWORD_RULE_MESSAGE);
      return;
    }
    if (password !== confirmation) {
      await showError(t('Passwords do not match.'));
      return;
    }
    try {
      await resetPassword({ token, newPassword: password });
    } catch (error) {
      await showError(toErrorMessage(error, t('Failed to reset password')));
      return;
    }
    // The backend signed out every session of the account, including one in this browser.
    if (user) await signOut();
    await showSuccess(t(PASSWORD_CHANGED_MESSAGE));
    void navigate(routes.auth, { replace: true });
  }, [token, password, confirmation, user, signOut, showError, showSuccess, navigate]);
  const [pending, run] = useAsyncAction(submit);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    run();
  };

  return (
    <AuthOverlay>
      <h1 className={styles.heading}>{t('Choose a New Password')}</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label={t('New password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('New password...')}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        <TextField
          label={t('Confirm new password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('Confirm new password...')}
          value={confirmation}
          onChange={(event) => {
            setConfirmation(event.target.value);
          }}
        />
        <p className={styles.hint}>{PASSWORD_RULE_MESSAGE}</p>
        <Button type="submit" fullWidth loading={pending} icon={<img src={lockIcon} alt="" />}>
          {t('RESET PASSWORD')}
        </Button>
        <Link to={routes.auth} className={styles.accentLink}>
          {t('Back to Sign In')}
        </Link>
      </form>
    </AuthOverlay>
  );
}

function MissingTokenNotice() {
  return (
    <AuthOverlay>
      <h1 className={styles.heading}>{t('Link Not Valid')}</h1>
      <p className={styles.message}>
        {t(
          'This reset link is incomplete. Please open the link from the email again, or request a new one.',
        )}
      </p>
      <Link to={routes.forgotPassword} className={styles.accentLink}>
        {t('Request a new link')}
      </Link>
    </AuthOverlay>
  );
}
