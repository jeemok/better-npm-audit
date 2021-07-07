/**
 * @param  {Any} value    The input number
 * @return {Boolean}      Returns true if the input is a whole number
 */
export function isWholeNumber(value: any): boolean {
  if (!Number(value)) {
    return false;
  }
  return value % 1 === 0;
}

/**
 * @param  {String} string    The JSON stringified object
 * @return {Boolean}          Returns true if the input string is parse-able
 */
export function isJsonString(string: string): boolean {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}
