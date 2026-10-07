import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';
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
  const Icon = orientation === 'vertical' ? ArrowUpDown : ArrowLeftRight;
  return (
    <button type="button" className={styles.swap} aria-label={label} onClick={onClick}>
      <Icon aria-hidden="true" />
    </button>
  );
}
