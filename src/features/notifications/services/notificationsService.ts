import { ApiError, apiRequest } from '@/lib/apiClient';
import { isRecord } from '@/lib/isRecord';
import type { Notification, NotificationPage, NotificationSettings } from '../types';

const UNEXPECTED = 'Unexpected response from the server.';

/** Tells the bells on screen that the unread count changed (the page marks things read). */
export const UNREAD_CHANGED = 'goawaygo:notifications-unread';

function isNotification(value: unknown): value is Notification {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.type === 'string' &&
    typeof value.message === 'string' &&
    typeof value.createdAt === 'string'
  );
}

/** Fills in what an older or partial answer may leave out (the type guard only checks the essentials). */
function toNotification(value: Notification): Notification {
  const raw: Record<string, unknown> = { ...value };
  return {
    ...value,
    detail: typeof raw.detail === 'string' ? raw.detail : '',
    read: raw.read === true,
    actor: isRecord(raw.actor) ? value.actor : null,
    postId: typeof raw.postId === 'string' ? raw.postId : null,
    planId: typeof raw.planId === 'string' ? raw.planId : null,
  };
}

/** The signed-in user's notifications, newest first; `before` continues from a page's `nextCursor`. */
export async function listNotifications(
  before?: number,
  signal?: AbortSignal,
): Promise<NotificationPage> {
  const query = before === undefined ? '' : `?before=${String(before)}`;
  const data = await apiRequest<unknown>(`/api/notifications${query}`, {
    fallbackError: 'Could not load your notifications.',
    signal,
  });
  if (!isRecord(data) || !Array.isArray(data.items)) throw new ApiError(UNEXPECTED, 200);
  return {
    items: data.items.filter(isNotification).map(toNotification),
    nextCursor: typeof data.nextCursor === 'number' ? data.nextCursor : null,
    unread: typeof data.unread === 'number' ? data.unread : 0,
  };
}

export async function unreadCount(signal?: AbortSignal): Promise<number> {
  const data = await apiRequest<unknown>('/api/notifications/unread', {
    fallbackError: 'Could not load your notifications.',
    signal,
  });
  return isRecord(data) && typeof data.unread === 'number' ? data.unread : 0;
}

/** Marks everything read; returns the new unread count (0). */
export async function markAllRead(): Promise<number> {
  const data = await apiRequest<unknown>('/api/notifications/read', {
    method: 'POST',
    fallbackError: 'Could not update your notifications.',
  });
  window.dispatchEvent(new Event(UNREAD_CHANGED));
  return isRecord(data) && typeof data.unread === 'number' ? data.unread : 0;
}

function toSettings(data: unknown): NotificationSettings {
  if (!isRecord(data)) throw new ApiError(UNEXPECTED, 200);
  return {
    wanderbook: data.wanderbook !== false,
    tripReminders: data.tripReminders !== false,
    sharedPlans: data.sharedPlans !== false,
    announcements: data.announcements !== false,
  };
}

export async function getSettings(signal?: AbortSignal): Promise<NotificationSettings> {
  return toSettings(
    await apiRequest<unknown>('/api/notifications/settings', {
      fallbackError: 'Could not load your notification settings.',
      signal,
    }),
  );
}

export async function saveSettings(settings: NotificationSettings): Promise<NotificationSettings> {
  return toSettings(
    await apiRequest<unknown>('/api/notifications/settings', {
      method: 'PUT',
      body: settings,
      fallbackError: 'Could not save your notification settings.',
    }),
  );
}

/** Admins only: a message to everyone. Returns how many accounts got it. */
export async function sendAnnouncement(title: string, text: string): Promise<number> {
  const data = await apiRequest<unknown>('/api/admin/announcements', {
    method: 'POST',
    body: { title, text },
    fallbackError: 'Could not send the announcement.',
  });
  return isRecord(data) && typeof data.sent === 'number' ? data.sent : 0;
}
