import { ApiError, apiRequest } from '@/lib/apiClient';
import { isRecord } from '@/lib/isRecord';
import type { DayPlan, Plan, PlanRequest, PlanSummary, Slot } from '../types';

const UNEXPECTED = 'Unexpected response from the server.';

/** Writing a plan takes the AI 10-40 s (longer when the free tier is busy). */
const CREATE_TIMEOUT_MS = 120_000;

function isSlot(value: unknown): value is Slot {
  return (
    isRecord(value) &&
    typeof value.place === 'string' &&
    typeof value.activity === 'string' &&
    typeof value.cost === 'number'
  );
}

function isDay(value: unknown): value is DayPlan {
  return (
    isRecord(value) &&
    typeof value.day === 'number' &&
    typeof value.date === 'string' &&
    typeof value.title === 'string' &&
    isSlot(value.morning) &&
    isSlot(value.afternoon) &&
    isSlot(value.evening) &&
    Array.isArray(value.food) &&
    typeof value.cost === 'number'
  );
}

function toPlan(data: unknown): Plan {
  if (
    !isRecord(data) ||
    typeof data.id !== 'string' ||
    typeof data.title !== 'string' ||
    !isRecord(data.place) ||
    !isRecord(data.estimate) ||
    !Array.isArray(data.dayPlans)
  ) {
    throw new ApiError(UNEXPECTED, 200);
  }
  const plan = data as unknown as Plan;
  return { ...plan, dayPlans: data.dayPlans.filter(isDay), tips: plan.tips.filter((t) => t) };
}

function isSummary(value: unknown): value is PlanSummary {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.placeName === 'string' &&
    typeof value.startDate === 'string' &&
    typeof value.days === 'number'
  );
}

/** Makes and saves a plan (signed in). */
export async function createPlan(request: PlanRequest): Promise<Plan> {
  const data = await apiRequest<unknown>('/api/plans', {
    method: 'POST',
    body: request,
    expectedStatus: 201,
    fallbackError: 'Could not make your plan.',
    signal: AbortSignal.timeout(CREATE_TIMEOUT_MS),
  });
  return toPlan(data);
}

/** The signed-in user's plans, newest first. */
export async function listPlans(signal?: AbortSignal): Promise<PlanSummary[]> {
  const data = await apiRequest<unknown>('/api/plans', {
    fallbackError: 'Could not load your plans.',
    signal,
  });
  if (!Array.isArray(data)) throw new ApiError(UNEXPECTED, 200);
  return data.filter(isSummary);
}

export async function getPlan(id: string, signal?: AbortSignal): Promise<Plan> {
  return toPlan(
    await apiRequest<unknown>(`/api/plans/${encodeURIComponent(id)}`, {
      fallbackError: 'Could not open this plan.',
      signal,
    }),
  );
}

/** A plan shared by link (anyone can open it). */
export async function getSharedPlan(id: string, signal?: AbortSignal): Promise<Plan> {
  return toPlan(
    await apiRequest<unknown>(`/api/plans/shared/${encodeURIComponent(id)}`, {
      fallbackError: 'Could not open this plan.',
      signal,
    }),
  );
}

export async function deletePlan(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/plans/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not delete this plan.',
  });
}

/** Rewrites one day (1-based), optionally following a wish ("more street food"). */
export async function changeDay(id: string, day: number, wish: string): Promise<Plan> {
  return toPlan(
    await apiRequest<unknown>(`/api/plans/${encodeURIComponent(id)}/days/${String(day)}`, {
      method: 'POST',
      body: { wish },
      fallbackError: 'Could not change this day.',
      signal: AbortSignal.timeout(CREATE_TIMEOUT_MS),
    }),
  );
}

export async function sharePlan(id: string, shared: boolean): Promise<Plan> {
  return toPlan(
    await apiRequest<unknown>(`/api/plans/${encodeURIComponent(id)}/share`, {
      method: 'PUT',
      body: { shared },
      fallbackError: shared ? 'Could not share this plan.' : 'Could not stop sharing.',
    }),
  );
}
