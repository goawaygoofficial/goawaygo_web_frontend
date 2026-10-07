import type { ReactNode } from 'react';
import { SwapButton } from '../SwapButton/SwapButton';
import styles from './FieldPair.module.css';

interface FieldPairProps {
  /** `vertical` stacks the fields (From / To); `horizontal` puts them side by side (dates). */
  orientation: 'vertical' | 'horizontal';
  first: ReactNode;
  /** Omit to render the first field alone (e.g. one-way trips have no return date). */
  second?: ReactNode;
  swapLabel: string;
  onSwap: () => void;
}

/** Two related fields with a swap button overlapping the seam between them. */
export function FieldPair({ orientation, first, second, swapLabel, onSwap }: FieldPairProps) {
  return (
    <div className={[styles.pair, styles[orientation]].join(' ')}>
      {first}
      {second !== undefined && (
        <>
          {second}
          <SwapButton orientation={orientation} label={swapLabel} onClick={onSwap} />
        </>
      )}
    </div>
  );
}
