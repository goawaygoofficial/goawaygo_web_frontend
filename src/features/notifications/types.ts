export type NotificationType =
  | 'follow'
  | 'follow_request'
  | 'follow_accepted'
  | 'like'
  | 'comment'
  | 'trip_reminder'
  | 'plan_opened'
  | 'announcement';

/** Who the notification is about (their Wanderbook profile). */
export interface Actor {
  publicId: string;
  name: string;
  photoUrl: string | null;
}

/** One line in the bell; the backend writes the text. */
export interface Notification {
  id: number;
  type: NotificationType;
  /** "Asha liked your post." */
  message: string;
  /** A comment's text or an announcement's message; empty otherwise. */
  detail: string;
  read: boolean;
  createdAt: string;
  actor: Actor | null;
  /** The post it opens (likes, comments). */
  postId: string | null;
  /** The trip plan it opens (reminders, shared plan opened). */
  planId: string | null;
}

export interface NotificationPage {
  items: Notification[];
  nextCursor: number | null;
  unread: number;
}

/** Which pushes the app sends (the bell lists everything either way). */
export interface NotificationSettings {
  wanderbook: boolean;
  tripReminders: boolean;
  sharedPlans: boolean;
  announcements: boolean;
}
