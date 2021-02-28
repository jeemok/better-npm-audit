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
  const { advisories } = JSON.parse(jsonBuffer);

  return Object.values(advisories)
    .filter(advisory => mapLevelToNumber(advisory.severity) >= auditLevel) // Filter out if there is requested audit level
    .map(advisory => advisory.id) // Map out the vulnerabilities IDs
    .filter(id => !exceptionIds.includes(id)); // Filter out exceptions provided by user
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
