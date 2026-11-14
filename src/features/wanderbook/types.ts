/** Shapes of the backend's Wanderbook API (`/api/wanderbook/*`), decided for 4.2 (README.md, Roadmap). */

export type Relationship = 'self' | 'following' | 'requested' | 'none';

/** A person in a list, search result, or as a post's author. */
export interface Person {
  publicId: string;
  name: string;
  photoUrl: string | null;
  homeTown: string | null;
  isPrivate: boolean;
}

/** A profile as the viewer sees it. */
export interface Profile {
  publicId: string;
  name: string;
  photoUrl: string | null;
  coverUrl: string | null;
  bio: string;
  homeTown: string;
  isPrivate: boolean;
  posts: number;
  followers: number;
  following: number;
  relationship: Relationship;
  followsYou: boolean;
  blockedByYou: boolean;
  /** False for a private profile the viewer doesn't follow. */
  canSeePosts: boolean;
  /** Waiting follow requests: only on your own profile. */
  followRequests: number | null;
}

export interface Page<T> {
  items: T[];
  nextCursor: number | null;
}

export interface Photo {
  id: string;
  url: string;
  width: number;
  height: number;
}

/** A place tag: names only (exact coordinates are never stored). */
export interface PlaceTag {
  name: string;
  region: string | null;
  country: string | null;
}

export interface Post {
  publicId: string;
  author: Person;
  caption: string;
  place: PlaceTag | null;
  photos: Photo[];
  likes: number;
  comments: number;
  likedByYou: boolean;
  isYours: boolean;
  createdAt: string;
  editedAt: string | null;
}

export interface Comment {
  id: number;
  author: Person;
  text: string;
  createdAt: string;
  canDelete: boolean;
}

/** An upload, with the place its location suggests. */
export interface Uploaded {
  photo: Photo;
  suggestedPlace: PlaceTag | null;
}

export type ReportTarget = 'post' | 'comment' | 'user';

export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or scam' },
  { id: 'nudity', label: 'Nudity or sexual content' },
  { id: 'violence', label: 'Violence or dangerous acts' },
  { id: 'hate', label: 'Hate speech or symbols' },
  { id: 'harassment', label: 'Bullying or harassment' },
  { id: 'self_harm', label: 'Self-harm' },
  { id: 'illegal', label: 'Illegal goods or activity' },
  { id: 'false_information', label: 'False information' },
  { id: 'other', label: 'Something else' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['id'];

export type WanderbookTab = 'mine' | 'feed';
