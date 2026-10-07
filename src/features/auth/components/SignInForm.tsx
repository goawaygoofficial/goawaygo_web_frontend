import { useCallback, useState } from 'react';
import type { SubmitEvent } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import emailIcon from '@/assets/icons/email.png';
import { Button, TextField } from '@/components';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useDialog } from '@/providers';
import { useCompleteSignIn } from '../hooks/useCompleteSignIn';
import { signIn } from '../services/authService';
import styles from './AuthForms.module.css';

interface SignInFormProps {
  onClose: () => void;
}

/** Email + password sign-in (state B of the auth screen). */
export function SignInForm({ onClose }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showError } = useDialog();
  const completeSignIn = useCompleteSignIn();

  const submit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || password.length === 0) {
      await showError('Please enter both email and password.');
      return;
    }
    try {
      const result = await signIn({ email: trimmedEmail, password });
      await completeSignIn(result, 'Welcome back');
    } catch (error) {
      await showError(toErrorMessage(error, 'Signin failed'));
      setEmail('');
      setPassword('');
    }
  }, [email, password, showError, completeSignIn]);
  const [pending, run] = useAsyncAction(submit);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    run();
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Sign in with email">
      <button
        type="button"
        className={styles.close}
        aria-label="Close sign-in form"
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </button>
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="Enter your Email address..."
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
        }}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Password..."
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <Link to={routes.forgotPassword} className={styles.forgot}>
        Forgot Password?
      </Link>
      <Button type="submit" fullWidth loading={pending} icon={<img src={emailIcon} alt="" />}>
        SIGN IN
      </Button>
      <Link to={routes.register} className={styles.accentLink}>
        Not Registered? Register
      </Link>
    </form>
  );
}
