import get from 'lodash.get';
import { table, TableUserConfig } from 'table';
import { SecurityReportHeader, ExceptionReportHeader } from 'src/types';

const SECURITY_REPORT_HEADER: SecurityReportHeader[] = ['ID', 'Module', 'Title', 'Paths', 'Sev.', 'URL', 'Ex.', 'DEV'];
const EXCEPTION_REPORT_HEADER: ExceptionReportHeader[] = ['ID', 'Status', 'Expiry', 'Notes'];

// TODO: Add unit tests
/**
 * Get the column width size for the table
 * @param {Array} tableData     Table data (Array of array)
 * @param {Number} columnIndex  Target column index
 * @param {Number} maxWidth     Maximum width
 * @param {Number} minWidth     Minimum width
 * @return {Number}             width
 */
export function getColumnWidth(tableData: string[][], columnIndex: number, maxWidth = 50, minWidth = 15): number {
  // Find the maximum length in the column
  const contentLength = tableData.reduce(
    (max, cur) => {
      let content = JSON.stringify(get(cur, columnIndex, ''));
      // Remove the color codes
      content = content.replace(/\\x1b\[\d{1,2}m/g, '');
      content = content.replace(/\\u001b\[\d{1,2}m/g, '');
      content = content.replace(/"/g, '');
      // Keep whichever number that is bigger
      return content.length > max ? content.length : max;
    },
    // Start with minimum width (also auto handling empty column case)
    minWidth,
  );
  // Return the content length up to a maximum point
  return Math.min(contentLength, maxWidth);
}

/**
 * Print the security report in a table format
 * @param  {Array} data   Array of arrays
 * @return {undefined}    Returns void
 */
export function printSecurityReport(data: string[][]): void {
  const configs: TableUserConfig = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== npm audit security report ===\n',
    },
    columns: {
      // "Title" column index
      2: {
        width: getColumnWidth(data, 2),
        wrapWord: true,
      },
      // "Paths" column index
      3: {
        width: getColumnWidth(data, 3),
        wrapWord: true,
      },
    },
  };

  console.info(table([SECURITY_REPORT_HEADER, ...data], configs));
}

/**
 * Print the exception report in a table format
 * @param  {Array} data   Array of arrays
 * @return {undefined}    Returns void
 */
export function printExceptionReport(data: string[][]): void {
  const configs: TableUserConfig = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== list of exceptions ===\n',
    },
  };

  console.info(table([EXCEPTION_REPORT_HEADER, ...data], configs));
}
