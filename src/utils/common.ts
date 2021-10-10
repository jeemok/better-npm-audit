/**
 * @param  {String | Number | Null | Boolean} value     The input number
 * @return {Boolean}                                    Returns true if the input is a whole number
 */
export function isWholeNumber(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (!Number(value)) {
    return false;
  }
  return Number(value) % 1 === 0;
}

/**
 * @param  {String} string    The JSON stringified object
 * @return {Boolean}          Returns true if the input string is parse-able
 */
export function isJsonString(string: string): boolean {
  try {
    JSON.parse(string);
  } catch (e) {
    console.log('Failed parsing .nsprc file: ' + e);
    return false;
  }
  return true;
}

// TODO: Add unit tests
/**
 * Trim array size to a maximum number
 * @param {Array} array       Array to trim
 * @param {Number} maxLength  Desired length
 * @return {Array}            Trimmed array with additional message
 */
export function trimArray(array: string[], maxLength: number): string[] {
  const originalLength = array.length;
  const removedLength = Math.max(0, originalLength - maxLength);
  if (removedLength === 0) {
    return array;
  }
  array.length = maxLength;
  return array.concat(`...and ${removedLength} more`);
}

// TODO: Add unit tests
/**
 * Clean text from color formatting
 * @param {String} string  Input
 * @return {String}
 */
export function cleanContent(string: string): string {
  let content = JSON.stringify(string);
  // Remove the color codes
  content = content.replace(/\\x1b\[\d{1,2}m/g, '');
  content = content.replace(/\\u001b\[\d{1,2}m/g, '');
  // Remove additional stringified "
  content = content.replace(/"/g, '');
  return content;
}

/**
 * Shorten node path (node_modules/nodemon/node_modules/chokidar/node_modules/fsevents) to (nodemon>chokidar>fsevents)
 * @param {String} path   Full node path
 * @return {String}       Shorten Path
 */
export function shortenNodePath(path: string): string {
  return path.replace('node_modules/', '').replace(/\/node_modules\//g, ' > ');
}
