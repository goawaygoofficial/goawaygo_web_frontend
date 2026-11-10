import type { PartnerCard } from '../types';
import styles from './BookCards.module.css';
import { t } from '@/lib/i18n';

interface PartnerCardLinkProps {
  partner: PartnerCard;
  /** Left side, under the partner's name ("Hotels in Jaipur"). */
  kind: string;
  /** Right side, bold ("See hotels for 7–9 Dec"). */
  title: string;
  /** Right side, under the title. */
  detail: string;
  onOpen: () => void;
}

/**
 * A partner (the founder's stay and car cards, without prices until a partner gives us live ones): the partner on the
 * light side, what opens on the dark side. Opens the partner's own search in a new tab.
 */
export function PartnerCardLink({ partner, kind, title, detail, onOpen }: PartnerCardLinkProps) {
  return (
    <a
      className={styles.card}
      href={partner.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={onOpen}
    >
      <span className={styles.side}>
        <span className={styles.price}>{partner.name}</span>
        <span className={styles.small}>{kind}</span>
        <span className={styles.small}>{t('Prices on {0}', partner.name)}</span>
      </span>
      <span className={styles.main}>
        <span className={styles.title}>{title}</span>
        <span className={styles.line}>{detail}</span>
      </span>
    </a>
  );
}
