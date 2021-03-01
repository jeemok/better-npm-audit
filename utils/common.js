const get = require('lodash.get');

/**
 * Converts an audit level to a numeric value for filtering purposes
 * @param  {String} auditLevel  The npm audit level
 * @return {Number}             The numeric value, higher is more severe
 */
function mapLevelToNumber(auditLevel) {
  switch (auditLevel) {
    case 'info':
      return 0;
    case 'low':
      return 1;
    case 'moderate':
      return 2;
    case 'high':
      return 3;
    case 'critical':
      return 4;
    default:
      return 0;
  }
}

/**
 * Analyze the JSON string buffer for vulnerabilities
 * @param  {String} jsonBuffer      NPM audit's JSON string buffer
 * @param  {Integer} auditLevel     Audit level in integer
 * @param  {Array} exceptionIds     List of exception vulnerabilities
 */
function getVulnerabilities(jsonBuffer = '', auditLevel = 0, exceptionIds = []) {
  // NPM v6 uses `advisories`
  // NPM v7 uses `vulnerabilities`
  // Refer to the test folder for some sample mockups
  const { advisories, vulnerabilities } = JSON.parse(jsonBuffer);

  // NPM v6 handling
  if (advisories) {
    return Object.values(advisories)
    .filter(advisory => mapLevelToNumber(advisory.severity) >= auditLevel) // Filter out if there is requested audit level
    .map(advisory => advisory.id) // Map out the vulnerabilities IDs
    .filter(id => !exceptionIds.includes(id)); // Filter out exceptions provided by user
  }

  // NPM v7 handling
  if (vulnerabilities) {
    return Object.values(vulnerabilities)
    .filter(vulnerability => mapLevelToNumber(vulnerability.severity) >= auditLevel) // Filter out if there is requested audit level
    // Map out the vulnerabilities IDs
    .reduce((acc, vulnerability) => {
      // Its stored inside `via` array, but sometimes it might be a String
      const cleanedArray = get(vulnerability, 'via', []).map(each => get(each, 'source')).filter(Boolean);
      // Compile into a single array
      return acc.concat(cleanedArray);
    }, [])
    .filter(id => !exceptionIds.includes(id)); // Filter out exceptions provided by user
  }

  return [];
}

function isWholeNumber(value) {
  if (!Number(value)) {
    return false;
  }
  return value % 1 === 0;
}

module.exports = {
  isWholeNumber,
  mapLevelToNumber,
  getVulnerabilities,
};
