import { Link } from 'react-router-dom';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { LegalPage, LegalSection, MailLink } from '../components/LegalPage';

/**
 * Terms of Use for the beta, for users in every country. Plain-language; to be reviewed by a lawyer before the
 * public launch (in particular the operator's legal name once the company is registered, the liability clause and
 * "Law and disputes").
 */
export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      summary={
        <>
          GoAwayGo is a free travel-planning service in beta. Use it fairly, keep your account safe,
          and remember that bookings you make on partner sites are between you and that partner.
          Questions: <MailLink address={legal.supportEmail} />.
        </>
      }
    >
      <LegalSection id="agreement" title="1. These terms">
        <p>
          These terms apply when you use the GoAwayGo website (goawaygo.com) or the GoAwayGo app
          (together, “GoAwayGo”), run by the GoAwayGo team in India (“we”, “us”). By creating an
          account or using GoAwayGo, you agree to them. Our{' '}
          <Link to={routes.privacy}>Privacy Policy</Link> explains how we handle your personal data.
        </p>
      </LegalSection>

      <LegalSection id="beta" title="2. GoAwayGo is in beta">
        <p>
          GoAwayGo is still being built. Features may change, be missing, or stop working for a
          while, and some information (such as destinations, prices or availability) may be sample
          data or incomplete. Please check important details with the official source before you
          rely on them. GoAwayGo is free during the beta.
        </p>
      </LegalSection>

      <LegalSection id="account" title="3. Your account">
        <ul>
          <li>You must be 18 or older to create an account.</li>
          <li>Give your real name and an email address you control, and keep them up to date.</li>
          <li>
            Keep your password secret. You are responsible for what happens in your account; tell us
            at once at <MailLink address={legal.supportEmail} /> if you think someone else has used
            it.
          </li>
          <li>One person, one account. Don't create accounts for others or with fake details.</li>
        </ul>
      </LegalSection>

      <LegalSection id="acceptable-use" title="4. Using GoAwayGo fairly">
        <p>You agree not to:</p>
        <ul>
          <li>break any law, or use GoAwayGo to harm, harass, impersonate or deceive anyone;</li>
          <li>
            post or share content that is unlawful, hateful, obscene, violent, misleading, or that
            infringes someone else's rights (for example, photos you don't own);
          </li>
          <li>
            try to access accounts or data that aren't yours, test or break our security, or
            interfere with the service (for example, with viruses or by overloading it);
          </li>
          <li>
            copy GoAwayGo's content in bulk, scrape it, or use bots without our written permission;
          </li>
          <li>resell or commercially exploit GoAwayGo without our written permission.</li>
        </ul>
        <p>
          If you find a security problem, please tell us privately at{' '}
          <MailLink address={legal.supportEmail} /> instead of using it.
        </p>
      </LegalSection>

      <LegalSection id="your-content" title="5. Content you share">
        <p>
          You own what you post (such as trip stories and photos, when these features arrive). You
          give us permission to store, show and share it inside GoAwayGo, as you choose, so the
          service works. You can delete it at any time. Only post what you have the right to share.
          We may remove content that breaks these terms or the law, and we act on valid complaints.
        </p>
      </LegalSection>

      <LegalSection id="partners" title="6. Travel partners and links">
        <p>
          GoAwayGo may show flights, stays, rentals and other offers from partner websites and link
          to them. GoAwayGo is not a travel agent and does not sell those services: any booking,
          payment, cancellation or refund is between you and the partner, under their terms. We may
          earn a commission when you book through a link; this never changes the price you pay. We
          aren't responsible for partner websites or their content.
        </p>
      </LegalSection>

      <LegalSection id="our-rights" title="7. Our content">
        <p>
          The GoAwayGo name, logo, design, app and text belong to us or our licensors. You may use
          them only to use GoAwayGo as intended.
        </p>
      </LegalSection>

      <LegalSection id="ending" title="8. Closing your account">
        <p>
          You can stop using GoAwayGo and ask us to delete your account at any time; see{' '}
          <Link to={routes.deleteMyData}>Delete my data</Link>. We may suspend or close an account
          that seriously or repeatedly breaks these terms, or if the law requires it; where we
          reasonably can, we tell you why first.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="9. Our responsibility">
        <p>
          We work hard to keep GoAwayGo available and correct, but during the beta we provide it “as
          is”, without promises that it will always work, be error-free, or that its information is
          complete. As far as the law allows, we are not responsible for indirect losses (such as
          missed trips or lost bookings with partners), and our total responsibility to you is
          limited to what you have paid us for GoAwayGo in the 12 months before the claim (GoAwayGo
          is currently free). Nothing in these terms limits rights you have under the consumer
          protection laws of the country where you live that can't be limited by contract.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. Changes to these terms">
        <p>
          We may update these terms as GoAwayGo grows. We change the date at the top, and for
          important changes we tell you by email or in the app before they apply. If you keep using
          GoAwayGo after that, the new terms apply; if you don't agree, you can close your account.
        </p>
      </LegalSection>

      <LegalSection id="law" title="11. Law and disputes">
        <p>
          Please contact us first at <MailLink address={legal.supportEmail} /> so we can try to
          solve any problem; we reply within {legal.responseDays} days.
        </p>
        <p>
          These terms are governed by the laws of India, where GoAwayGo is run. If you use GoAwayGo
          as a consumer, you also keep the protection of the mandatory laws of the country where you
          live, and you can bring a claim in the courts there if that law gives you the right to.
          Otherwise, disputes go to the courts of India. If you live in the EU, you can also use
          your national consumer dispute-resolution bodies.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p>
          General questions: <MailLink address={legal.supportEmail} />. Privacy and your data:{' '}
          <MailLink address={legal.privacyEmail} />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
