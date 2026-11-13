import { usePageMeta } from '@/lib/pageMeta';
import { t } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { LegalPage, LegalSection, MailLink } from '../components/LegalPage';

/**
 * Community Guidelines for Wanderbook (required by the app stores for apps where people post). Plain language;
 * part of the Terms of Use. To be reviewed by a lawyer with the other legal pages before the public launch.
 */
export function CommunityGuidelinesPage() {
  usePageMeta(
    t('Community Guidelines'),
    t('The rules for sharing in Wanderbook, the GoAwayGo travel community.'),
  );
  return (
    <LegalPage
      title="Community Guidelines"
      summary={
        <>
          Wanderbook is a place for travel memories. Share your own trips, be kind, and keep it safe
          for everyone. These guidelines are part of our <Link to={routes.terms}>Terms of Use</Link>
          .
        </>
      }
    >
      <LegalSection id="share" title="1. Share your own travels">
        <ul>
          <li>
            Post photos you took or have the right to share, and credit others where it's fair.
          </li>
          <li>
            Don't pretend to be someone else, and don't post other people's private information.
          </li>
          <li>
            Ask before posting close-up photos of other people, and never of children who aren't
            yours.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="not-allowed" title="2. Not allowed">
        <ul>
          <li>
            Nudity or sexual content, and anything sexual involving minors (reported to the
            authorities).
          </li>
          <li>Violence, gore, threats, or encouraging dangerous acts or self-harm.</li>
          <li>Hate speech, or attacks on people for who they are.</li>
          <li>Bullying, harassment, or repeatedly contacting someone who doesn't want it.</li>
          <li>Selling or promoting illegal goods, weapons or drugs, or illegal activity.</li>
          <li>Spam, scams, fake engagement, or misleading information that could cause harm.</li>
          <li>Content that infringes someone else's copyright or trademark.</li>
        </ul>
      </LegalSection>

      <LegalSection id="checks" title="3. How we keep Wanderbook safe">
        <p>
          Photos and text are checked automatically before they appear, and anything that breaks
          these guidelines can't be posted. People can report posts, comments and profiles; our team
          reviews every report and may remove content, and close accounts for serious or repeated
          breaches. You can block anyone: you won't see each other, and follows between you end.
        </p>
      </LegalSection>

      <LegalSection id="help" title="4. If you need help">
        <p>
          Report anything that worries you from the post, comment or profile menu. If someone is in
          immediate danger, contact your local emergency services first. Questions or appeals:{' '}
          <MailLink address={legal.supportEmail} />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
