export interface WanderbookStats {
  /** Display-ready counts (e.g. "14.2K"). */
  posts: string;
  followers: string;
  following: string;
}

/** The header of a Wanderbook profile. */
export interface WanderbookProfile {
  name: string;
  location: string;
  bio: readonly string[];
  stats: WanderbookStats;
}

export interface WanderPost {
  id: string;
  location: string;
  caption: string;
}

export type WanderbookTab = 'mine' | 'feed';
