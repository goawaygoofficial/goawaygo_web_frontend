import feature01 from '@/assets/images/auth_image_01.png';
import feature02 from '@/assets/images/auth_image_02.png';
import feature03 from '@/assets/images/auth_image_03.png';
import styles from './FeatureList.module.css';

const FEATURES = [
  { icon: feature01, text: 'Travel the World in Your Terms' },
  { icon: feature02, text: 'Personalised Travel Plans' },
  { icon: feature03, text: 'Your Own WanderBook' },
] as const;

/**
 * The three selling points shown on Auth, Register and the signed-out Profile tab.
 * One component instead of the app's two `FeatureItem` copies.
 */
export function FeatureList() {
  return (
    <ul className={styles.list}>
      {FEATURES.map((feature) => (
        <li key={feature.text} className={styles.item}>
          <img src={feature.icon} alt="" className={styles.icon} />
          <span>{feature.text}</span>
        </li>
      ))}
    </ul>
  );
}
