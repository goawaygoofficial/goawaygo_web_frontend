import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { WanderbookTab } from '../types';
import { panelId, tabId } from './tabIds';
import styles from './WanderbookTabs.module.css';

const WANDERBOOK_TABS = [
  { id: 'mine', label: 'My Wanderposts' },
  { id: 'feed', label: 'Feed Post' },
] as const satisfies readonly { id: WanderbookTab; label: string }[];

interface WanderbookTabsProps {
  value: WanderbookTab;
  onChange: (tab: WanderbookTab) => void;
}

/** Sticky pill tabs (WAI-ARIA tabs pattern, arrow keys move between tabs). */
export function WanderbookTabs({ value, onChange }: WanderbookTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = WANDERBOOK_TABS.findIndex((tab) => tab.id === value);
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next =
      WANDERBOOK_TABS[(index + offset + WANDERBOOK_TABS.length) % WANDERBOOK_TABS.length];
    if (!next) return;
    onChange(next.id);
    listRef.current?.querySelector<HTMLButtonElement>(`#${tabId(next.id)}`)?.focus();
  };

  return (
    <div className={styles.sticky}>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Wanderbook posts"
        className={styles.list}
        onKeyDown={onKeyDown}
      >
        {WANDERBOOK_TABS.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              id={tabId(tab.id)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(tab.id)}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => {
                onChange(tab.id);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
