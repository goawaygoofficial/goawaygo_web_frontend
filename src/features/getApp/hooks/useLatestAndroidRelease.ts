import { useEffect, useState } from 'react';
import { appLinks } from '@/lib/appLinks';
import type { AndroidRelease, ApkFile } from '../types';

export type LatestReleaseState =
  { kind: 'loading' } | { kind: 'ready'; release: AndroidRelease } | { kind: 'unavailable' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toApkFile(value: unknown): ApkFile | null {
  if (!isRecord(value)) return null;
  const { url, size, sha256 } = value;
  if (typeof url !== 'string' || !url.startsWith('https://')) return null;
  if (typeof size !== 'number' || typeof sha256 !== 'string') return null;
  return { url, size, sha256 };
}

/** Validates latest.json (written by app_frontend/scripts/release-android.sh); anything malformed is ignored. */
function toRelease(value: unknown): AndroidRelease | null {
  if (!isRecord(value) || !isRecord(value.files)) return null;
  const { version, build, date, notes } = value;
  const arm64 = toApkFile(value.files.arm64);
  if (
    typeof version !== 'string' ||
    typeof build !== 'number' ||
    typeof date !== 'string' ||
    !arm64
  ) {
    return null;
  }
  return {
    version,
    build,
    date,
    notes: typeof notes === 'string' ? notes : '',
    arm64,
    universal: toApkFile(value.files.universal),
  };
}

/** The newest Android build published for direct download, read from the release manifest. */
export function useLatestAndroidRelease(): LatestReleaseState {
  const [state, setState] = useState<LatestReleaseState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetch(appLinks.androidManifestUrl, { signal: controller.signal, cache: 'no-cache' })
      .then((response) => (response.ok ? (response.json() as Promise<unknown>) : null))
      .then((body) => {
        const release = toRelease(body);
        setState(release ? { kind: 'ready', release } : { kind: 'unavailable' });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({ kind: 'unavailable' });
      });
    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
