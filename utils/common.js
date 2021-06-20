/**
 * @param  {Any} value    The input number
 * @return {Boolean}      Returns true if the input is a whole number
 */
function isWholeNumber(value) {
  if (!Number(value)) {
    return false;
  }
  return value % 1 === 0;
}

/**
 * @param  {String} string    The JSON stringified object
 * @return {Boolean}          Returns true if the input string is parse-able
 */
function isJsonString(string) {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = {
  isWholeNumber,
  isJsonString,
};
