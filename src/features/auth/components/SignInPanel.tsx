import { useState } from 'react';
import emailIcon from '@/assets/icons/email.png';
import { Button } from '@/components';
import { SignUpNotice } from '@/features/legal';
import type { AuthFlow } from '../authFlow';
import { GoogleSignInButton } from './GoogleSignInButton';
import { SignInForm } from './SignInForm';
import styles from './SignInPanel.module.css';

/**
 * "Continue with Google" + "SIGN IN", cross-fading into the email form in place. The same panel is used on the
 * sign-in page and on the Profile tab, as in the app.
 */
export function SignInPanel({ flow }: { flow: AuthFlow }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={styles.crossFade}>
      <div
        className={[styles.state, !showForm && styles.visible].filter(Boolean).join(' ')}
        inert={showForm}
      >
        <GoogleSignInButton redirectTo={flow.redirectTo} />
        <Button
          fullWidth
          icon={<img src={emailIcon} alt="" />}
          onClick={() => {
            setShowForm(true);
          }}
        >
          SIGN IN
        </Button>
        <SignUpNotice />
      </div>
      <div
        className={[styles.state, showForm && styles.visible].filter(Boolean).join(' ')}
        inert={!showForm}
      >
        {showForm && (
          <SignInForm
            flow={flow}
            onClose={() => {
              setShowForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
