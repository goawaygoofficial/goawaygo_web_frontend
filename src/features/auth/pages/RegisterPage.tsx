import { useCallback, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, FeatureList, TextField } from '@/components';
import { SignUpNotice } from '@/features/legal';
import { useAsyncAction } from '@/hooks';
import { track } from '@/lib/analytics';
import { toErrorMessage } from '@/lib/apiClient';
import { PASSWORD_RULE_MESSAGE, REQUIRED_FIELDS_MESSAGE, isStrongPassword } from '@/lib/validation';
import { useDialog } from '@/providers';
import { useAuthFlow } from '../authFlow';
import { AuthOverlay } from '../components/AuthOverlay';
import { signUp } from '../services/authService';
import styles from '../components/AuthForms.module.css';
import { t } from '@/lib/i18n';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showError, showSuccess } = useDialog();
  const navigate = useNavigate();
  const flow = useAuthFlow();

  const submit = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length === 0 || trimmedEmail.length === 0 || password.length === 0) {
      await showError(REQUIRED_FIELDS_MESSAGE);
      return;
    }
    if (!isStrongPassword(password)) {
      await showError(PASSWORD_RULE_MESSAGE);
      return;
    }
    try {
      await signUp({ name: trimmedName, email: trimmedEmail, password });
      track({ name: 'sign_up_completed', props: { method: 'email' } });
      await showSuccess(t('Account created! You can now sign in.'));
      void navigate(flow.signInPath, { replace: true });
    } catch (error) {
      await showError(toErrorMessage(error, t('Signup failed')));
    }
  }, [name, email, password, showError, showSuccess, navigate, flow]);
  const [pending, run] = useAsyncAction(submit);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    run();
  };

  return (
    <AuthOverlay>
      <h1 className="visually-hidden">{t('Register')}</h1>
      <FeatureList />
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label={t('Name')}
          autoComplete="name"
          placeholder={t('Enter your Name...')}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <TextField
          label={t('Email address')}
          type="email"
          autoComplete="email"
          placeholder={t('Enter your Email address...')}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <TextField
          label={t('Password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('Password...')}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        <SignUpNotice />
        <Button type="submit" fullWidth loading={pending}>
          {t('REGISTER')}
        </Button>
        <Link to={flow.signInPath} className={styles.accentLink}>
          {t('Already have an account? Sign In')}
        </Link>
      </form>
    </AuthOverlay>
  );
}
