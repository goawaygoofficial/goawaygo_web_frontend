import { useEffect, useState } from 'react';
import { useUser } from '@/providers';
import { UNREAD_CHANGED, unreadCount } from '../services/notificationsService';

/** How often an open page checks for new notifications. */
const REFRESH_MS = 2 * 60 * 1000;

/**
 * The bell's unread count for the signed-in user (0 signed out). Checked on load, when the tab comes back into view,
 * every two minutes while it is visible, and when the notifications page marks things read.
 */
export function useUnreadCount(): number {
  const { user } = useUser();
  const userId = user?.id;
  const [count, setCount] = useState<{ userId: number; unread: number } | null>(null);

  useEffect(() => {
    if (userId === undefined) return;
    let controller = new AbortController();
    const load = () => {
      controller.abort();
      controller = new AbortController();
      unreadCount(controller.signal).then(
        (unread) => {
          setCount({ userId, unread });
        },
        () => {
          // Keep the last count; it refreshes again soon.
        },
      );
    };
    // Later checks only while the tab is in view; the first one always.
    const refresh = () => {
      if (document.visibilityState === 'visible') load();
    };
    load();
    const timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener(UNREAD_CHANGED, load);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener(UNREAD_CHANGED, load);
    };
  }, [userId]);

  return count !== null && count.userId === userId ? count.unread : 0;
}
