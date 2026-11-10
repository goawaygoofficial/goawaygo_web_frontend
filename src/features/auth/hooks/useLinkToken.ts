import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reads the `?token=` of an emailed link once, then removes it from the address bar, so the single-use token
 * doesn't stay in the browser history or get sent onward in a `Referer` header. Returns `null` if the link had none.
 */
export function useLinkToken(): string | null {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => {
    const value = searchParams.get('token')?.trim();
    return value && value.length > 0 ? value : null;
  });

  useEffect(() => {
    if (searchParams.has('token')) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  return token;
}
