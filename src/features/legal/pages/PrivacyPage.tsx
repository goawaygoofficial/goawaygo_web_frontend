import { Link } from 'react-router-dom';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { LegalPage, LegalSection, MailLink } from '../components/LegalPage';
import styles from '../components/LegalPage.module.css';

/**
 * Privacy notice under India's Digital Personal Data Protection Act 2023 and Rules 2025: what we collect, why, who
 * processes it, how long we keep it, the user's rights and how to complain. Keep it true to what the backend and
 * apps actually do; change `legal.lastUpdated` with every change in meaning. To be reviewed by a lawyer before
 * the public launch.
 */
export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary={
        <>
          We collect only what Goaway needs to run your account, keep it safe and fix problems. We
          don't sell your data or show you ads. You can see, correct or delete your data at any
          time: write to <MailLink address={legal.privacyEmail} />.
        </>
      }
    >
      <LegalSection id="who-we-are" title="1. Who we are">
        <p>
          Goaway (the website at goawaygo.com and the Goaway app) is run by the Goaway team in
          India. We are the “Data Fiduciary” for your personal data under India's Digital Personal
          Data Protection Act, 2023 (the “DPDP Act”). Goaway is in beta and the company is being
          registered; this policy will name it once that is done.
        </p>
        <p>
          Contact for anything about your data: <MailLink address={legal.privacyEmail} />.
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="2. What we collect and why">
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Why we use it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name and email address</td>
                <td>To create and run your account, and to greet you in the app.</td>
              </tr>
              <tr>
                <td>Password</td>
                <td>
                  To sign you in. We store only a one-way scrambled form (a hash); nobody, including
                  us, can read your password.
                </td>
              </tr>
              <tr>
                <td>
                  Google account ID and whether your email is verified (only if you use “Continue
                  with Google”)
                </td>
                <td>
                  To sign you in with Google. We don't receive your Google password or contacts.
                </td>
              </tr>
              <tr>
                <td>
                  Sign-in sessions: a protected token, your browser or device type, and when you
                  signed in
                </td>
                <td>To keep you signed in and to let us end sessions if something looks wrong.</td>
              </tr>
              <tr>
                <td>Single-use links we email you (verify email, reset password)</td>
                <td>To confirm your email address and let you reset a forgotten password.</td>
              </tr>
              <tr>
                <td>Technical data: IP address, time, page or feature used</td>
                <td>
                  To protect the service (e.g. limiting repeated sign-in attempts) and to fix
                  errors.
                </td>
              </tr>
              <tr>
                <td>
                  Crash and error reports: app or browser version, device model, operating system
                  and what went wrong
                </td>
                <td>
                  To find and fix bugs. These reports don't contain your name, email or IP address.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We use your data only for these purposes. Giving us your name, email and a password (or
          using Google) is needed to have an account; you can use the rest of the website and app
          without one.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="3. Cookies and website analytics">
        <ul>
          <li>
            <strong>One essential cookie</strong> keeps you signed in on the website. It can't be
            read by JavaScript or by other websites, and it isn't used for tracking. The app keeps
            the same sign-in in your phone's secure storage instead.
          </li>
          <li>
            <strong>Visitor statistics</strong> on the website come from Cloudflare Web Analytics,
            which uses no cookies and doesn't identify you; we see only totals such as page views.
          </li>
          <li>We don't use advertising or social-media trackers.</li>
        </ul>
        <p>
          If we later add optional product analytics, we will ask for your consent first, and you
          will be able to change your choice at any time.
        </p>
      </LegalSection>

      <LegalSection id="who-processes" title="4. Who processes your data for us">
        <p>
          We use these trusted service providers (“Data Processors”). They may only use your data to
          provide their service to us, under contract.
        </p>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col">What they do</th>
                <th scope="col">Where</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google Cloud</td>
                <td>Runs our servers and keeps server logs</td>
                <td>Singapore</td>
              </tr>
              <tr>
                <td>Neon (on Amazon Web Services)</td>
                <td>Hosts our database</td>
                <td>Singapore</td>
              </tr>
              <tr>
                <td>Cloudflare</td>
                <td>Hosts the website and app downloads, forwards our email, website statistics</td>
                <td>Worldwide network</td>
              </tr>
              <tr>
                <td>Resend</td>
                <td>Sends account emails (verification, password reset)</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Sentry</td>
                <td>Collects crash and error reports</td>
                <td>Germany (EU)</td>
              </tr>
              <tr>
                <td>Google</td>
                <td>
                  “Continue with Google” sign-in; beta app delivery (Firebase App Distribution, if
                  you join the beta); our team inbox (Gmail) for emails you send us
                </td>
                <td>Worldwide</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          So your data may be processed outside India. The DPDP Act allows this, except to countries
          the Government of India restricts; none of these are. We don't sell or rent your data to
          anyone, and we share it with authorities only when Indian law requires it.
        </p>
      </LegalSection>

      <LegalSection id="how-long" title="5. How long we keep it">
        <ul>
          <li>
            <strong>Your account</strong> (name, email, password hash, Google ID, sign-in sessions):
            while you have an account. When you ask us to delete it, we do so within{' '}
            {legal.responseDays} days.
          </li>
          <li>
            <strong>Emailed links</strong>: they stop working after 30 minutes (password reset) or
            24 hours (email verification), and are deleted with your account.
          </li>
          <li>
            <strong>Server logs</strong> (including IP addresses): deleted automatically after 30
            days.
          </li>
          <li>
            <strong>Crash and error reports</strong>: deleted automatically after 30 days.
          </li>
          <li>
            <strong>Database backups</strong>: overwritten within 7 days, so deleted data disappears
            from them too.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="security" title="6. How we protect it">
        <ul>
          <li>
            All connections are encrypted (HTTPS); the database only accepts encrypted connections.
          </li>
          <li>
            Passwords are stored as hashes; sign-in sessions and emailed links are stored as hashes
            too.
          </li>
          <li>Only the people who run Goaway can access our systems and data.</li>
          <li>
            Repeated sign-in attempts are limited, and crash reports have personal data removed.
          </li>
        </ul>
        <p>
          If a personal data breach happens, we will tell the affected users and the Data Protection
          Board of India as the DPDP Rules require, with what happened, what it means for you and
          what we are doing about it.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="7. Your rights">
        <p>Under the DPDP Act you can ask us to:</p>
        <ul>
          <li>
            <strong>See</strong> a summary of the personal data we hold about you and how we use it.
          </li>
          <li>
            <strong>Correct, complete or update</strong> it.
          </li>
          <li>
            <strong>Delete</strong> it. See <Link to={routes.deleteMyData}>Delete my data</Link>.
          </li>
          <li>
            <strong>Withdraw consent</strong> you have given, as easily as you gave it. This doesn't
            affect what we did before.
          </li>
          <li>
            <strong>Nominate</strong> someone to use these rights for you if you die or can't act
            yourself.
          </li>
          <li>
            <strong>Complain</strong> to us (see below).
          </li>
        </ul>
        <p>
          Write to <MailLink address={legal.privacyEmail} /> from the email address of your account,
          so we know it's you. We answer within {legal.responseDays} days.
        </p>
      </LegalSection>

      <LegalSection id="grievances" title="8. Questions and complaints">
        <p>
          Our grievance contact is the Goaway privacy team at{' '}
          <MailLink address={legal.privacyEmail} />. We acknowledge every complaint and resolve it
          within {legal.responseDays} days. If you're not satisfied with our answer, you can
          complain to the Data Protection Board of India.
        </p>
      </LegalSection>

      <LegalSection id="children" title="9. Children">
        <p>
          Goaway is for people aged 18 or over. We don't knowingly create accounts for children; if
          you believe a child has an account, write to us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="language" title="10. Language">
        <p>
          You can ask for this notice in any of the languages in the Eighth Schedule to the
          Constitution of India by writing to <MailLink address={legal.privacyEmail} />.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to this policy">
        <p>
          When this policy changes, we update the date at the top. If a change affects how we use
          your data, we tell you by email or in the app before it applies and, where needed, ask for
          your consent again.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
