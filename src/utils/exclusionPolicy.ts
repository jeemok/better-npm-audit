import { normalizeExpiry } from './date';
import dayjs from 'dayjs';

export interface ExclusionPolicy {
  readonly requireNotes?: boolean;
  readonly requireExpiry?: boolean;
  readonly maxExpiryDays?: number | string;
}

/**
 * Check the `.nsprc` exclusions against the policy flags.
 * A string value in `.nsprc` is a note without an expiry date.
 * @param  {Object} nsprc         The parsed `.nsprc` content
 * @param  {Object} policy        The policy flags
 * @param  {Number} now           The current time in ms (injectable for tests)
 * @return {Array<String>}        A list of violations, empty if the policy is satisfied
 */
export function getExclusionPolicyErrors(nsprc: Record<string, unknown>, policy: ExclusionPolicy, now = Date.now()): string[] {
  const errors: string[] = [];
  const maxDays = policy.maxExpiryDays === undefined ? undefined : Number(policy.maxExpiryDays);
  const latestAllowed = maxDays === undefined || isNaN(maxDays) ? undefined : dayjs(now).add(maxDays, 'day');

  Object.entries(nsprc).forEach(([id, value]) => {
    const isNote = typeof value === 'string';
    const entry = (isNote ? {} : value || {}) as { notes?: string; expiry?: string | number };
    const notes = isNote ? value : entry.notes;

    if (policy.requireNotes && !notes) {
      errors.push(`Exclusion ${id} in .nsprc is missing notes`);
    }
    if (policy.requireExpiry && !entry.expiry) {
      errors.push(`Exclusion ${id} in .nsprc is missing an expiry date`);
    }
    if (latestAllowed && entry.expiry && dayjs(normalizeExpiry(entry.expiry)).isAfter(latestAllowed)) {
      errors.push(`Exclusion ${id} in .nsprc expires too far in the future (maximum ${maxDays} days from today)`);
    }
  });

  return errors;
}
