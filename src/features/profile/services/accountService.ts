import { apiRequest } from '@/lib/apiClient';
import { isRecord } from '@/lib/isRecord';
import { startSession } from '@/lib/session';
import { isUserDto, userFromDto } from '@/types';
import type { User } from '@/types';
import type { Proof, RecentlyViewed, Regions, ViewedPlace, ViewedPlan } from '../types';
import { t } from '@/lib/i18n';

function toUser(data: unknown): User {
  if (!isUserDto(data)) throw new Error(t('Unexpected response from server.'));
  return userFromDto(data);
}

/** Name (also the Wanderbook name), country and currency; null clears a choice. */
export async function updateDetails(details: {
  name: string;
  country: string | null;
  currency: string | null;
}): Promise<User> {
  return toUser(
    await apiRequest<unknown>('/api/users/me', {
      method: 'PUT',
      body: details,
      fallbackError: 'Could not save your details.',
    }),
  );
}

let regions: Promise<Regions> | null = null;

/** Every country (with its currency) and currency, loaded once per visit. */
export function getRegions(): Promise<Regions> {
  regions ??= apiRequest<unknown>('/api/regions', {
    fallbackError: 'Could not load countries.',
  }).then(
    (data) => {
      if (!isRecord(data) || !Array.isArray(data.countries) || !Array.isArray(data.currencies)) {
        throw new Error(t('Unexpected response from server.'));
      }
      return data as unknown as Regions;
    },
    (cause: unknown) => {
      regions = null;
      throw cause;
    },
  );
  return regions;
}

/**
 * Changes the password (or sets the first one). The backend signs out every device and returns a new session for
 * this one (the new refresh cookie arrives with it).
 */
export async function changePassword(proof: Proof, newPassword: string): Promise<User> {
  const data = await apiRequest<unknown>('/api/auth/change-password', {
    method: 'POST',
    body: { ...proof, newPassword },
    fallbackError: 'Could not change your password.',
  });
  return userFromDto(startSession(data).user);
}

/** Emails a confirmation link to the new address; the account keeps its email until it is opened. */
export async function changeEmail(proof: Proof, newEmail: string): Promise<User> {
  return toUser(
    await apiRequest<unknown>('/api/auth/change-email', {
      method: 'POST',
      body: { ...proof, newEmail },
      fallbackError: 'Could not change your email.',
    }),
  );
}

/** Deleted for good after 30 days (signing in before then keeps it). Resolves with that date (ISO). */
export async function deleteAccount(proof: Proof): Promise<string> {
  const data = await apiRequest<unknown>('/api/auth/delete-account', {
    method: 'POST',
    body: proof,
    fallbackError: 'Could not delete your account.',
  });
  return isRecord(data) && typeof data.deleteOn === 'string' ? data.deleteOn : '';
}

function isViewedPlace(value: unknown): value is ViewedPlace {
  if (!isRecord(value) || typeof value.viewedAt !== 'string' || !isRecord(value.place))
    return false;
  const { place } = value;
  return (
    typeof place.name === 'string' &&
    typeof place.label === 'string' &&
    typeof place.lat === 'number' &&
    typeof place.lon === 'number'
  );
}

function isViewedPlan(value: unknown): value is ViewedPlan {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.placeName === 'string' &&
    typeof value.mine === 'boolean'
  );
}

export async function getRecentlyViewed(signal?: AbortSignal): Promise<RecentlyViewed> {
  const data = await apiRequest<unknown>('/api/me/recently-viewed', {
    signal,
    fallbackError: 'Could not load what you viewed.',
  });
  if (!isRecord(data)) throw new Error(t('Unexpected response from server.'));
  return {
    places: Array.isArray(data.places) ? data.places.filter(isViewedPlace) : [],
    plans: Array.isArray(data.plans) ? data.plans.filter(isViewedPlan) : [],
  };
}

export async function clearRecentlyViewed(): Promise<void> {
  await apiRequest<unknown>('/api/me/recently-viewed', {
    method: 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not clear the list.',
  });
}
