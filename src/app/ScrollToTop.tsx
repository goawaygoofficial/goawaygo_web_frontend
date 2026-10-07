import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/** Root route element: resets scroll on navigation so each screen opens at the top. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return <Outlet />;
}
