import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Returns a "go back" handler. Uses browser history when the user navigated here inside the app,
 * otherwise (deep link / refresh) goes to `fallback` so Back never leaves the site.
 */
export function useBack(fallback: string): () => void {
  const navigate = useNavigate();
  const location = useLocation();
  const hasInAppHistory = location.key !== 'default';

  return useCallback(() => {
    if (hasInAppHistory) void navigate(-1);
    else void navigate(fallback, { replace: true });
  }, [hasInAppHistory, navigate, fallback]);
}
