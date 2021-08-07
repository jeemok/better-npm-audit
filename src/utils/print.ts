import get from 'lodash.get';
import { table, TableUserConfig } from 'table';
import { SecurityReportHeader, ExceptionReportHeader, MaintainerReportHeader, ParsedCommandOptions } from 'src/types';

const SECURITY_REPORT_HEADER: SecurityReportHeader[] = ['ID', 'Module', 'Title', 'Paths', 'Sev.', 'URL', 'Ex.'];
const EXCEPTION_REPORT_HEADER: ExceptionReportHeader[] = ['ID', 'Status', 'Expiry', 'Notes'];
const MAINTAINER_REPORT_HEADER: MaintainerReportHeader[] = ['ID', 'Status', 'Expiry', 'Notes', 'Path'];
const SCAN_PATH = 'Scan path(s)';
const SCAN_PATH_COLUMN_MIN_WIDTH = 15;
const SCAN_PATH_COLUMN_MAX_WIDTH = 45;

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
 * @param  {Array} data       Array of arrays
 * @param  {Object} options   Parsed command options
 * @return {undefined}        Returns void
 */
export function printSecurityReport(data: string[][], options: ParsedCommandOptions): void {
  // Additional header for debug mode
  const headers = options.debug ? [...SECURITY_REPORT_HEADER, SCAN_PATH, 'Found file(s)'] : SECURITY_REPORT_HEADER;
  // Set table column configs
  let debugColumns = {};
  if (options.debug) {
    const scanPathColumnIndex = headers.findIndex((header) => header === SCAN_PATH);
    // Find the maximum scan path size
    const maxLength = data.reduce(
      (max, cur) => (get(cur, scanPathColumnIndex, '').length > max ? get(cur, scanPathColumnIndex, '').length : max),
      0,
    );
    debugColumns = {
      [scanPathColumnIndex]: {
        width: maxLength === 0 ? SCAN_PATH_COLUMN_MIN_WIDTH : Math.min(maxLength, SCAN_PATH_COLUMN_MAX_WIDTH),
        wrapWord: true,
      },
    };
  }
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
      ...debugColumns,
    },
  };

  console.info(table([headers, ...data], configs));
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

/**
 * Print the exception report in a table format
 * @param  {Array} data   Array of arrays
 * @return {undefined}    Returns void
 */
export function printMaintainerReport(data: string[][]): void {
  const configs: TableUserConfig = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== internal modules exceptions ===\n',
    },
  };

  console.info(table([MAINTAINER_REPORT_HEADER, ...data], configs));
}
