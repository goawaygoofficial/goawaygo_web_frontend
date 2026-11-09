import { isRecord } from '@/lib/isRecord';
import type { Plan } from './types';

/**
 * Shared trip plans a signed-out visitor opened, kept only in this browser (localStorage; the Privacy Policy says
 * so) for their Recently viewed. Signed-in users' views are kept by their account instead.
 */

const KEY = 'goawaygo.recentPlans';
/** Same as the account's list (backend PlanViews.KEEP). */
const MAX_PLANS = 30;

export interface RememberedPlan {
  id: string;
  title: string;
  placeName: string;
  country: string;
  startDate: string;
  days: number;
  viewedAt: string;
}

function isRememberedPlan(value: unknown): value is RememberedPlan {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.placeName === 'string' &&
    typeof value.country === 'string' &&
    typeof value.startDate === 'string' &&
    typeof value.days === 'number' &&
    typeof value.viewedAt === 'string'
  );
}

export function readRecentPlans(): RememberedPlan[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRememberedPlan).slice(0, MAX_PLANS) : [];
  } catch {
    return [];
  }
}

/** Puts the plan first (once), keeping the newest 30. */
export function rememberPlan(plan: Plan): void {
  const entry: RememberedPlan = {
    id: plan.id,
    title: plan.title,
    placeName: plan.place.name,
    country: plan.place.country,
    startDate: plan.startDate,
    days: plan.days,
    viewedAt: new Date().toISOString(),
  };
  const next = [entry, ...readRecentPlans().filter((p) => p.id !== plan.id)].slice(0, MAX_PLANS);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: just not remembered.
  }
}

export function forgetRecentPlans(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable: nothing was remembered.
  }
}
