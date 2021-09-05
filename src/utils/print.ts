import get from 'lodash.get';
import { table, TableUserConfig } from 'table';
import { SecurityReportHeader, ExceptionReportHeader, ScanReportHeader } from 'src/types';
import { cleanContent } from './common';

const SECURITY_REPORT_HEADER: SecurityReportHeader[] = ['ID', 'Module', 'Title', 'Paths', 'Sev.', 'URL', 'Ex.'];
const EXCEPTION_REPORT_HEADER: ExceptionReportHeader[] = ['ID', 'Status', 'Expiry', 'Notes'];
const SCAN_REPORT_HEADER: ScanReportHeader[] = ['ID', 'Module', 'Version', 'Status', 'Expiry', 'Notes', '.nsprc'];

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
      const content = cleanContent(get(cur, columnIndex, ''));
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
 * Print the security report
 * @param  {Array} data       Array of arrays
 * @return {undefined}        Returns void
 */
export function printSecurityReport(data: string[][]): void {
  const columns = {
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
  };

  const configs: TableUserConfig = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== npm audit security report ===\n',
    },
    columns,
  };

  console.info(table([SECURITY_REPORT_HEADER, ...data], configs));
}

/**
 * Print the exception report
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
 * Print the scan report
 * @param  {Array} data   Array of arrays
 * @return {undefined}    Returns void
 */
export function printScanReport(data: string[][]): void {
  const columns = {
    // "Node" column index
    2: {
      width: getColumnWidth(data, 2, 40),
      wrapWord: true,
    },
    // "Notes" column index
    5: {
      width: getColumnWidth(data, 5),
      wrapWord: true,
    },
    // ".nsprc" column index
    6: {
      width: getColumnWidth(data, 6),
      wrapWord: true,
    },
  };

  const configs: TableUserConfig = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== auto exclusion scan report ===\n',
    },
    columns,
  };

  console.info(table([SCAN_REPORT_HEADER, ...data], configs));
}
