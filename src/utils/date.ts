import dayjs from 'dayjs';
import { DateAnalysis } from 'src/types';

/**
 * Validate if the given timestamp is a valid UNIX timestamp
 * @param   {Any} timestamp   The given timestamp
 * @return  {Boolean}         Returns true if it is a valid UNIX timestamp
 */
export function isValidDate(timestamp: string | number): boolean {
  return new Date(timestamp).getTime() > 0;
}

/**
 * Analyze the given date time if it has expired (in the past)
 * @param  {String | Number} expiry     Expiry timestamp
 * @param  {String | Number} now        The date to compare with
 * @return {Object}                     Return the analysis
 */
export function analyzeExpiry(expiry?: string | number, now: string | number = new Date().valueOf()): DateAnalysis {
  if (!expiry) {
    return { valid: true };
  }

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
