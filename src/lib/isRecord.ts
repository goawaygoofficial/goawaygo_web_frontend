/** True for a plain object (e.g. parsed JSON) whose fields can be read safely. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
