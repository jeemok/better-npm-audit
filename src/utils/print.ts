import get from 'lodash.get';
import { table, TableUserConfig } from 'table';
import { SecurityReportHeader, ExceptionReportHeader, MaintainerReportHeader, ParsedCommandOptions } from 'src/types';

const SECURITY_REPORT_HEADER: SecurityReportHeader[] = ['ID', 'Module', 'Title', 'Sev.', 'URL', 'Ex.'];
const EXCEPTION_REPORT_HEADER: ExceptionReportHeader[] = ['ID', 'Status', 'Expiry', 'Notes'];
const MAINTAINER_REPORT_HEADER: MaintainerReportHeader[] = ['ID', 'Status', 'Expiry', 'Notes', 'Path'];
const SCAN_PATH = 'Scan path(s)';
const SCAN_PATH_COLUMN_MAX_WIDTH = 45;

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
  let columns = {};
  if (options.debug) {
    const scanPathColumnIndex = headers.findIndex((header) => header === SCAN_PATH);
    // Find the maximum scan path size
    const maxLength = data.reduce(
      (max, cur) => (get(cur, scanPathColumnIndex, '').length > max ? get(cur, scanPathColumnIndex, '').length : max),
      0,
    );
    columns = {
      [scanPathColumnIndex]: { width: maxLength === 0 ? undefined : Math.min(maxLength, SCAN_PATH_COLUMN_MAX_WIDTH), wrapWord: true },
    };
  }
  const configs: TableUserConfig = {
    singleLine: true,
    header: {
      alignment: 'center',
      content: '=== npm audit security report ===\n',
    },
    columns,
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
