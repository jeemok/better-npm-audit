import dayjs from 'dayjs';
import { DateAnalysis } from 'src/types';

/**
 * Validate if the given timestamp is a valid UNIX timestamp
 * @param   {Any} timestamp   The given timestamp
 * @return  {Boolean}         Returns true if it is a valid UNIX timestamp
 */
export function isValidDate(timestamp: string | number): boolean {
  return !isNaN(new Date(timestamp).getTime());
}

// A number below this is read as seconds since the epoch (as UNIX time is defined), otherwise as milliseconds.
// 1e11 ms is March 1973 and 1e11 s is the year 5138, so no real expiry is read the wrong way.
const SECONDS_LIMIT = 1e11;

/**
 * Normalize an expiry for date parsing: a number of seconds becomes milliseconds; anything else is left as is.
 * @param  {String | Number} expiry   The expiry as written in `.nsprc`
 * @return {String | Number}          The expiry, with numbers in milliseconds
 */
export function normalizeExpiry<T extends string | number | undefined>(expiry: T): T | number {
  return typeof expiry === 'number' && Math.abs(expiry) < SECONDS_LIMIT ? expiry * 1000 : expiry;
}

/**
 * Analyze the given date time if it has expired (in the past)
 * @param  {String | Number} rawExpiry  Expiry timestamp (a number is read as seconds or milliseconds)
 * @param  {String | Number} now        The date to compare with
 * @return {Object}                     Return the analysis
 */
export function analyzeExpiry(rawExpiry?: string | number, now: string | number = new Date().valueOf()): DateAnalysis {
  if (!rawExpiry) {
    return { valid: true };
  }
  const expiry = normalizeExpiry(rawExpiry) as string | number;

  if (!isValidDate(expiry) || !isValidDate(now)) {
    return { valid: false };
  }

  const dayjsNow = dayjs(now);

  return {
    valid: true,
    expired: dayjsNow.isAfter(expiry),
    years: dayjsNow.diff(expiry, 'years'),
  };
}
