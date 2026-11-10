import { Icon } from '../Icon/Icon';
import styles from './SwapButton.module.css';

interface SwapButtonProps {
  orientation: 'vertical' | 'horizontal';
  label: string;
  onClick: () => void;
}

/**
 * Circular swap control centred over the seam between two fields.
 * Place it inside a `position: relative` wrapper around the pair (see `FieldPair`).
 */
export function SwapButton({ orientation, label, onClick }: SwapButtonProps) {
  return (
    <button type="button" className={styles.swap} aria-label={label} onClick={onClick}>
      <Icon name={orientation === 'vertical' ? 'swap_vert' : 'swap_horiz'} />
    </button>
  );
}
