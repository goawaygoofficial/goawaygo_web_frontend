import { useId, useState } from 'react';
import { Icon } from '@/components';
import type { CardItem, InfoCard as InfoCardData } from '@/features/discover';
import { CARD_META } from '../cardMeta';
import styles from './InfoCard.module.css';
import { t } from '@/lib/i18n';

/** "https://www.indianvisaonline.gov.in/evisa" → "indianvisaonline.gov.in" */
function siteName(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return t('Official site');
  }
}

function Item({ item }: { item: CardItem }) {
  return (
    <li className={styles.item}>
      <span className={styles.label}>{item.label}</span>
      <span className={styles.detail}>{item.detail}</span>
      {(item.mayChange || item.link) && (
        <span className={styles.meta}>
          {item.mayChange && (
            <span className={styles.mayVary}>{t('May vary, check before you go')}</span>
          )}
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {siteName(item.link)}
              <Icon name="open_in_new" />
            </a>
          )}
        </span>
      )}
    </li>
  );
}

/** One of the nine AI cards: tap to expand. A card with nothing checked and valid says so and doesn't open. */
export function InfoCard({ card }: { card: InfoCardData }) {
  const meta = CARD_META[card.id];
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className={[styles.card, open && styles.open].filter(Boolean).join(' ')}>
      <h2 className={styles.heading}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={card.available ? open : undefined}
          aria-controls={card.available ? panelId : undefined}
          disabled={!card.available}
          onClick={() => {
            setOpen((value) => !value);
          }}
        >
          <span className={styles.iconCircle} aria-hidden="true">
            <Icon name={meta.icon} />
          </span>
          <span className={styles.text}>
            <span className={styles.title}>{t(meta.title)}</span>
            <span className={styles.subtitle}>
              {card.available ? t(meta.subtitle) : t('Not available right now')}
            </span>
          </span>
          {card.available && (
            <span className={styles.chevron} aria-hidden="true">
              <Icon name="expand_more_rounded" />
            </span>
          )}
        </button>
      </h2>
      {card.available && (
        <div id={panelId} className={styles.panel} hidden={!open}>
          <ul className={styles.items}>
            {card.items.map((item, index) => (
              <Item key={`${String(index)}-${item.label}`} item={item} />
            ))}
          </ul>
          <p className={styles.note}>
            {card.id === 'visa' &&
              `${t('Rules change: always check official sources before you travel.')} `}
            {t('AI-generated, may contain mistakes.')}
          </p>
        </div>
      )}
    </li>
  );
}
