import type { WanderbookTab } from '../types';

/** DOM ids linking each tab to its panel (aria-controls / aria-labelledby). */
export const tabId = (tab: WanderbookTab) => `wanderbook-tab-${tab}`;
export const panelId = (tab: WanderbookTab) => `wanderbook-panel-${tab}`;
