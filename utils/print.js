const table = require('table').table;

const SECURITY_REPORT_HEADER = ['ID', 'Module', 'Title', 'Sev.', 'URL', 'Ex.'];
const EXCEPTION_REPORT_HEADER = ['ID', 'Status', 'Expiry', 'Notes'];

/**
 * Print the security report in a table format
 * @param  {Array} data   Array of arrays
 * @return {undefined}    Returns void
 */
function printSecurityReport(data) {
  const configs = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== npm audit security report ===\n',
    },
  };

  console.info(table([SECURITY_REPORT_HEADER, ...data], configs));
}

/**
 * Print the exception report in a table format
 * @param  {Array} data   Array of arrays
 * @return {undefined}    Returns void
 */
function printExceptionReport(data) {
  const configs = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== list of exceptions ===\n',
    },
  };

  console.info(table([EXCEPTION_REPORT_HEADER, ...data], configs));
}

module.exports = {
  printSecurityReport,
  printExceptionReport,
};
