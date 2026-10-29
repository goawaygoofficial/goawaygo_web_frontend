import { Link } from 'react-router-dom';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { LegalPage, LegalSection, MailLink } from '../components/LegalPage';

/**
 * How to delete a GoAwayGo account and its data. Also the account-deletion URL that Google Play requires for the
 * app's listing. Until the in-app "Delete account" button exists (Phase 4.3), deletion is by email request.
 */
export function DeleteDataPage() {
  return (
    <LegalPage
      title="Delete my data"
      summary={
        <>
          Wherever you live, you can delete your GoAwayGo account and personal data at any time,
          free of charge: your “right to erasure” or “right to delete” under privacy laws such as
          the GDPR, US state laws and India's DPDP Act. Email us from your account's address and we
          delete everything within {legal.responseDays} days.
        </>
      }
    >
      <LegalSection id="how" title="How to delete your account">
        <ol>
          <li>
            Send an email to{' '}
            <MailLink address={legal.privacyEmail} subject="Delete my GoAwayGo account" /> from the
            email address you use for GoAwayGo, with the subject “Delete my GoAwayGo account”.
            Signed up with Google? Use that Google account's email address.
          </li>
          <li>
            We reply to confirm the request came from you. If you write from another address, we
            will ask you to confirm from your account's address first; this stops anyone else from
            deleting your account.
          </li>
          <li>
            We delete your account within {legal.responseDays} days and email you when it's done.
          </li>
        </ol>
        <p>A “Delete account” button in the app and on the website is coming soon.</p>
      </LegalSection>

      <LegalSection id="what" title="What is deleted">
        <ul>
          <li>Your account: name, email address, password hash and Google sign-in link.</li>
          <li>All your sign-in sessions, on every device (you are signed out everywhere).</li>
          <li>Any unused verification or password-reset links.</li>
          <li>Your recent searches and the places you saved to My Trips.</li>
          <li>
            Your Wanderbook profile, posts and their photos, comments, likes, follows and blocks.
          </li>
          <li>Any content you have added to GoAwayGo.</li>
        </ul>
        <p>
          Server logs and crash reports are deleted automatically after 30 days, and database
          backups are overwritten within 7 days. We keep only what the law requires us to keep (for
          example, a record that you asked for deletion), and only for as long as it requires.
        </p>
      </LegalSection>

      <LegalSection id="other" title="Other things you can do">
        <ul>
          <li>
            Want to keep your account but remove or correct some data? Write to{' '}
            <MailLink address={legal.privacyEmail} /> and tell us what to change.
          </li>
          <li>
            Signed in with Google? You can also remove GoAwayGo's access in your Google Account
            under{' '}
            <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">
              Third-party apps &amp; services
            </a>
            . This doesn't delete your GoAwayGo account; email us for that.
          </li>
          <li>
            Uninstalling the app removes the data it keeps on your phone, but not your account.
          </li>
        </ul>
        <p>
          More about your rights is in our <Link to={routes.privacy}>Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
