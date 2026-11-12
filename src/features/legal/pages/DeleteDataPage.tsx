import { Link } from 'react-router-dom';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { LegalPage, LegalSection, MailLink } from '../components/LegalPage';

/**
 * How to delete a GoAwayGo account and its data: the "Delete account" button in the app and on the website (4.6),
 * or an email. Also the account-deletion URL that Google Play requires for the app's listing.
 */
export function DeleteDataPage() {
  return (
    <LegalPage
      title="Delete my data"
      summary={
        <>
          Wherever you live, you can delete your GoAwayGo account and personal data at any time,
          free of charge: your “right to erasure” or “right to delete” under privacy laws such as
          the GDPR, US state laws and India's DPDP Act. Delete it yourself in the app or on the
          website, or email us. You then have 30 days to change your mind; after that, everything is
          deleted for good.
        </>
      }
    >
      <LegalSection id="how" title="How to delete your account">
        <ol>
          <li>
            In the app or on the website, sign in and open <strong>Profile</strong> →{' '}
            <strong>User Profile</strong> → <strong>Delete account</strong>. Confirm with your
            password (or with Google, if you sign in with Google).
          </li>
          <li>
            Your account is signed out on every device and hidden from other people at once, and we
            email you the date it will be deleted: 30 days later. Changed your mind? Sign in before
            then and your account stays as it was.
          </li>
          <li>
            After the 30 days, everything listed below is deleted for good, and we email you to say
            it's done.
          </li>
        </ol>
        <p>Can't sign in? Delete your account by email instead:</p>
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
            Within {legal.responseDays} days we start the same 30 days (signing in before they end
            keeps your account), then delete everything and email you when it's done.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="what" title="What is deleted">
        <ul>
          <li>
            Your account: name, photo, email address, password hash, Google sign-in link, country
            and currency.
          </li>
          <li>All your sign-in sessions, on every device (you are signed out everywhere).</li>
          <li>Any unused verification, password-reset or email-change links.</li>
          <li>
            The places and trip plans you viewed, the places you saved to My Trips and your trip
            plans.
          </li>
          <li>Your notifications, notification settings and the push tokens of your phones.</li>
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
