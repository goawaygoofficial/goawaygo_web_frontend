import { Link } from 'react-router-dom';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { LegalPage, LegalSection, MailLink } from '../components/LegalPage';
import styles from '../components/LegalPage.module.css';

/**
 * One privacy policy for every country, written to the strictest common standard: the EU and UK GDPR, US state
 * privacy laws (California CCPA/CPRA and similar), India's DPDP Act 2023, Brazil's LGPD and comparable laws.
 * Country-specific extras are in "Extra information for your region". Keep it true to what the backend and apps
 * actually do; change `legal.lastUpdated` with every change in meaning. To be reviewed by a lawyer before the
 * public launch.
 */
export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary={
        <>
          We collect only what GoAwayGo needs to run your account, keep it safe and fix problems. We
          don't sell your data, share it for advertising, or show you ads. Wherever you live, you
          can see, correct, download or delete your data at any time: write to{' '}
          <MailLink address={legal.privacyEmail} />.
        </>
      }
    >
      <LegalSection id="who-we-are" title="1. Who we are">
        <p>
          GoAwayGo (the website at goawaygo.com and the GoAwayGo app) is run by the GoAwayGo team,
          based in India. We decide how and why your personal data is used, so we are responsible
          for it: the “controller” under the EU and UK GDPR, the “business” under US state privacy
          laws, and the “Data Fiduciary” under India's Digital Personal Data Protection Act.
          GoAwayGo is in beta and the company is being registered; this policy will name it once
          that is done.
        </p>
        <p>
          Contact for anything about your data, including our privacy team:{' '}
          <MailLink address={legal.privacyEmail} />.
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="2. What we collect, why, and on what legal basis">
        <p>
          Some laws (such as the GDPR) require a “legal basis” for each use of personal data. Ours
          are shown in the last column.
        </p>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Why we use it</th>
                <th scope="col">Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name and email address</td>
                <td>To create and run your account, and to greet you in the app.</td>
                <td>Contract: needed to give you the account you asked for</td>
              </tr>
              <tr>
                <td>Password</td>
                <td>
                  To sign you in. We store only a one-way scrambled form (a hash); nobody, including
                  us, can read your password.
                </td>
                <td>Contract</td>
              </tr>
              <tr>
                <td>
                  Google account ID and whether your email is verified (only if you use “Continue
                  with Google”)
                </td>
                <td>
                  To sign you in with Google. We don't receive your Google password or contacts.
                </td>
                <td>Contract (you choose this way of signing in)</td>
              </tr>
              <tr>
                <td>
                  Sign-in sessions: a protected token, your browser or device type, and when you
                  signed in
                </td>
                <td>To keep you signed in and to end sessions if something looks wrong.</td>
                <td>Contract; legitimate interest in keeping accounts secure</td>
              </tr>
              <tr>
                <td>Single-use links we email you (verify email, reset password)</td>
                <td>To confirm your email address and let you reset a forgotten password.</td>
                <td>Contract</td>
              </tr>
              <tr>
                <td>
                  Your recent searches, if you are signed in: the last 5 places you opened and when
                </td>
                <td>To show your recent searches on Home, on every device you use.</td>
                <td>Contract</td>
              </tr>
              <tr>
                <td>Places you save to My Trips</td>
                <td>To keep the places you saved, on every device you use.</td>
                <td>Contract</td>
              </tr>
              <tr>
                <td>Technical data: IP address, time, page or feature used</td>
                <td>
                  To protect the service (e.g. limiting repeated sign-in attempts) and to fix
                  errors.
                </td>
                <td>Legitimate interest in security and a working service</td>
              </tr>
              <tr>
                <td>
                  Crash and error reports: app or browser version, device model, operating system
                  and what went wrong
                </td>
                <td>
                  To find and fix bugs. These reports don't contain your name, email or IP address.
                </td>
                <td>Legitimate interest in a working service</td>
              </tr>
              <tr>
                <td>
                  Usage statistics, <strong>only if you allow them</strong>: pages and features
                  used, a random ID for your browser or app, device and browser type
                </td>
                <td>
                  To understand which features are useful and improve GoAwayGo. Never linked to your
                  name or email, and no IP address is kept.
                </td>
                <td>Consent, which you can withdraw at any time</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We use your data only for these purposes. Where we rely on legitimate interest, we have
          checked that it doesn't override your rights, and you can object (see section 8). Giving
          us your name, email and a password (or using Google) is needed to have an account; you can
          use the rest of the website and app without one. We don't collect sensitive data (such as
          health, religion or precise location), and we don't make decisions about you by automated
          means alone.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="3. Cookies, device storage and analytics">
        <ul>
          <li>
            <strong>One strictly necessary cookie</strong> keeps you signed in on the website. It
            can't be read by JavaScript or by other websites, isn't used for tracking, and doesn't
            need consent. The app keeps the same sign-in in your phone's secure storage instead.
          </li>
          <li>
            <strong>Visitor statistics</strong> on the website come from Cloudflare Web Analytics,
            which uses no cookies and doesn't identify you; we see only totals such as page views.
          </li>
          <li>
            <strong>Your recent searches, if you are not signed in</strong>: the last 5 places you
            opened are kept in your browser's storage (or in the app) to show them on Home. They
            stay on your device; clearing your browser's site data removes them.
          </li>
          <li>We don't use advertising, cross-site tracking or social-media cookies.</li>
        </ul>
        <p>
          <strong>Optional usage statistics (PostHog).</strong> The website and the app ask once
          whether you allow anonymous usage statistics; “No thanks” is as easy as “Allow”, and
          nothing is collected or stored until you allow it. If you do, PostHog keeps a random ID in
          your browser's storage (or in the app) so visits can be counted, and we record which pages
          and features are used. We don't record what you type, take recordings of your screen, or
          link the statistics to your account. You can change your choice at any time under{' '}
          <strong>Privacy choices</strong> (at the bottom of the website, and in the app's Profile);
          saying no removes the ID from your device.
        </p>
        <p>
          Your choice itself is remembered on your device so we don't ask again; that is strictly
          necessary and contains nothing about you.
        </p>
      </LegalSection>

      <LegalSection id="who-processes" title="4. Who processes your data for us">
        <p>
          We use these trusted service providers (“processors”). They may only use your data to
          provide their service to us, under a data protection agreement.
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
                <td>PostHog</td>
                <td>Usage statistics, only if you allow them</td>
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
          <strong>Travel information and photos.</strong> To build destination pages we send only
          place names and locations, never anything about you, to: Google's Gemini AI (writes the
          travel information), Geoapify (finds places as you type), and Wikipedia, Wikidata and
          Unsplash (find photos). Photos are then loaded by your browser or the app directly from
          Wikimedia Commons and Unsplash, which receive your IP address and browser details, as any
          website you visit would. Their own privacy policies apply to that.
        </p>
        <p>
          We don't sell your personal data, and we don't share it for targeted advertising. We
          disclose it to authorities only when the law requires it, and we would tell you unless the
          law forbids that.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="5. International transfers">
        <p>
          Our team is in India and our providers work in the countries listed above, so your data
          may be processed outside the country where you live. Wherever it goes, it gets the
          protection described in this policy:
        </p>
        <ul>
          <li>
            From the EU, EEA, UK or Switzerland, transfers are covered by the European Commission's
            Standard Contractual Clauses (and the UK addendum) in our providers' data protection
            agreements, or go to countries recognised as giving adequate protection.
          </li>
          <li>
            Under India's DPDP Act, we don't transfer data to any country the Government of India
            restricts.
          </li>
          <li>Elsewhere, we rely on equivalent safeguards that your local law recognises.</li>
        </ul>
        <p>
          You can ask us for more information about these safeguards at{' '}
          <MailLink address={legal.privacyEmail} />.
        </p>
      </LegalSection>

      <LegalSection id="how-long" title="6. How long we keep it">
        <ul>
          <li>
            <strong>Your account</strong> (name, email, password hash, Google ID, sign-in sessions):
            while you have an account. When you ask us to delete it, we do so within{' '}
            {legal.responseDays} days.
          </li>
          <li>
            <strong>Recent searches</strong> (signed in): only the last 5 are kept; older ones are
            deleted as you search, and all are deleted with your account.{' '}
            <strong>Places in My Trips</strong>: until you remove them or delete your account.
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
            <strong>Usage statistics</strong> (only if you allowed them): deleted automatically
            after 12 months; they aren't linked to your account, so they can't identify you.
          </li>
          <li>
            <strong>Database backups</strong>: overwritten within 7 days, so deleted data disappears
            from them too.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="security" title="7. How we protect it">
        <ul>
          <li>
            All connections are encrypted (HTTPS); the database only accepts encrypted connections.
          </li>
          <li>
            Passwords are stored as hashes; sign-in sessions and emailed links are stored as hashes
            too.
          </li>
          <li>Only the people who run GoAwayGo can access our systems and data.</li>
          <li>
            Repeated sign-in attempts are limited, and crash reports have personal data removed.
          </li>
        </ul>
        <p>
          If a personal data breach affects you, we will tell you without undue delay, with what
          happened, what it means for you and what we are doing about it, and we will notify the
          data protection authorities within the time the law sets (for example, within 72 hours
          under the GDPR).
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="8. Your rights">
        <p>We give these rights to everyone, wherever you live. You can ask us to:</p>
        <ul>
          <li>
            <strong>Access</strong>: tell you what personal data we hold about you and how we use
            it, and give you a copy.
          </li>
          <li>
            <strong>Correct</strong> data that is wrong or incomplete.
          </li>
          <li>
            <strong>Delete</strong> your data. See{' '}
            <Link to={routes.deleteMyData}>Delete my data</Link>.
          </li>
          <li>
            <strong>Portability</strong>: give you your data in a common, machine-readable format
            (such as JSON), or send it to another service.
          </li>
          <li>
            <strong>Object</strong> to uses based on legitimate interest, or{' '}
            <strong>restrict</strong> how we use your data while a question is being sorted out.
          </li>
          <li>
            <strong>Withdraw consent</strong> you have given, as easily as you gave it (for usage
            statistics: “Privacy choices”). This doesn't affect what we did before.
          </li>
          <li>
            <strong>Appeal</strong> if we turn down your request: reply to our answer and someone
            who wasn't involved will review it.
          </li>
        </ul>
        <p>
          Write to <MailLink address={legal.privacyEmail} /> from the email address of your account,
          so we know it's you. Someone you authorise can also ask for you, with your written
          permission. We answer within {legal.responseDays} days (we may extend this where the law
          allows, and will tell you why). Using your rights is free, and we will never treat you
          differently for using them.
        </p>
        <p>
          You also have the right to complain to a data protection authority; see section 9. We'd
          appreciate the chance to sort it out first.
        </p>
      </LegalSection>

      <LegalSection id="your-region" title="9. Extra information for your region">
        <p>
          <strong>European Union, EEA, United Kingdom and Switzerland.</strong> The GDPR (or UK GDPR
          / Swiss FADP) applies. Our legal bases are listed in section 2. You can complain to the
          data protection authority where you live or work, such as the UK Information
          Commissioner's Office (ICO).
        </p>
        <p>
          <strong>United States (California and other states with privacy laws).</strong> In the
          last 12 months we have collected these categories of personal information: identifiers
          (name, email, account and device identifiers, IP address), internet or app activity (pages
          and features used, error reports) and account login details. We collect them from you,
          your device and, if you choose, Google. We use them only for the purposes in section 2 and
          disclose them only to the providers in section 4. We have not sold or shared personal
          information for cross-context behavioural advertising, and we don't knowingly do so for
          anyone under 16, so there is nothing to opt out of; a Global Privacy Control signal from
          your browser is respected by default. You have the rights in section 8 (to know, delete,
          correct and appeal) without discrimination. If we deny an appeal, you can contact your
          state's Attorney General.
        </p>
        <p>
          <strong>India.</strong> Under the DPDP Act, our grievance contact is the GoAwayGo privacy
          team at <MailLink address={legal.privacyEmail} />; we acknowledge every complaint and
          resolve it within {legal.responseDays} days. If you're not satisfied, you can complain to
          the Data Protection Board of India. You can also nominate someone to use your rights if
          you die or can't act yourself, and ask for this notice in any language of the Eighth
          Schedule to the Constitution of India.
        </p>
        <p>
          <strong>Brazil.</strong> Under the LGPD you have the rights in section 8, including
          confirmation that we process your data and information about who we share it with, and you
          can complain to the ANPD.
        </p>
        <p>
          <strong>Everywhere else.</strong> If your country has a privacy law (for example Canada,
          Australia, Singapore, Japan, South Africa or the UAE), you have the rights it gives you,
          and at least those in section 8. You can complain to your national privacy authority.
        </p>
      </LegalSection>

      <LegalSection id="children" title="10. Children">
        <p>
          GoAwayGo is for people aged 18 or over, everywhere. We don't knowingly collect data from
          children; if you believe a child has an account, write to us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to this policy">
        <p>
          When this policy changes, we update the date at the top. If a change affects how we use
          your data, we tell you by email or in the app before it applies and, where needed, ask for
          your consent again.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p>
          Privacy questions and requests: <MailLink address={legal.privacyEmail} />. Anything else:{' '}
          <MailLink address={legal.supportEmail} />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
