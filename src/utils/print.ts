import { table, TableUserConfig } from 'table';
import { SecurityReportHeader, ExceptionReportHeader } from 'src/types';

const SECURITY_REPORT_HEADER: SecurityReportHeader[] = ['ID', 'Module', 'Title', 'Paths', 'Severity', 'URL', 'Fix', 'Scope', 'Ex.'];
// The `Fix` and `Scope` columns are opt-in via `--include-columns`
const DEFAULT_SECURITY_REPORT_HEADER = SECURITY_REPORT_HEADER.filter((h) => h !== 'Fix' && h !== 'Scope');
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
      let content = JSON.stringify(cur?.[columnIndex] ?? '');
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

// Characters `table` adds around a column: 1 border + 1 padding each side, plus one closing border for the table
const COLUMN_OVERHEAD = 3;
const MIN_WRAPPED_WIDTH = 10;

// eslint-disable-next-line no-control-regex
const stripAnsi = (text: string): string => text.replace(/\u001b\[[0-9;]*m/g, '');

/**
 * Longest line of a column (header included), ignoring color codes
 * @param {Array} rows          Rows including the header
 * @param {Number} columnIndex  Target column index
 * @return {Number}             Width in characters
 */
function getNaturalWidth(rows: string[][], columnIndex: number): number {
  return rows.reduce(
    (max, row) =>
      String(row[columnIndex] ?? '')
        .split('\n')
        .reduce((lineMax, line) => Math.max(lineMax, stripAnsi(line).length), max),
    0,
  );
}

/**
 * Shrink the widest of the given columns, one character at a time, until the table fits (or the floor is reached)
 * @param {Object} widths     Column widths by index (changed in place)
 * @param {Array} shrinkable  Indexes of the columns that may shrink
 * @param {Number} excess     Number of characters to remove
 * @param {Number} floor      Narrowest width allowed
 * @return {Number}           Excess that is still left
 */
function shrinkColumns(widths: Record<number, number>, shrinkable: number[], excess: number, floor: number): number {
  let left = excess;
  while (left > 0) {
    const widest = shrinkable.reduce((a, b) => (widths[b] > widths[a] ? b : a), shrinkable[0]);
    if (widest === undefined || widths[widest] <= floor) break;
    widths[widest] -= 1;
    left -= 1;
  }
  return left;
}

/**
 * Print the security report in a table format
 * @param  {Array} data               Array of arrays
 * @param  {Array} columnsToInclude   List of columns to include in audit results
 * @param  {Number} terminalWidth     Width of the terminal in characters; no limit when unknown (e.g. output is piped)
 * @return {undefined}                Returns void
 */
export function printSecurityReport(
  data: string[][],
  columnsToInclude: string[],
  terminalWidth: number | undefined = process.stdout.columns,
): void {
  let headers = DEFAULT_SECURITY_REPORT_HEADER;
  if (columnsToInclude.length) {
    headers = SECURITY_REPORT_HEADER.filter((h) => columnsToInclude.includes(h));
  }

  // Wrap the "Title" and "Paths" columns, wherever they are when only some columns are included
  const columns: Record<number, { width: number; wrapWord: boolean }> = {};
  headers.forEach((header, index) => {
    if (header === 'Title' || header === 'Paths') {
      columns[index] = { width: getColumnWidth(data, index), wrapWord: true };
    }
  });

  // Make the table fit the terminal: shrink the wrapped columns first, then the URL column (broken mid-word)
  if (terminalWidth && terminalWidth > 0) {
    const rows = [headers as string[], ...data];
    const widths: Record<number, number> = {};
    headers.forEach((_, index) => {
      widths[index] = columns[index] ? columns[index].width : getNaturalWidth(rows, index);
    });
    const total = () => Object.values(widths).reduce((sum, w) => sum + w, 0) + COLUMN_OVERHEAD * headers.length + 1;

    const wrappedIndexes = Object.keys(columns).map(Number);
    let excess = total() - terminalWidth;
    excess = shrinkColumns(widths, wrappedIndexes, excess, MIN_WRAPPED_WIDTH);
    wrappedIndexes.forEach((index) => (columns[index].width = widths[index]));

    const urlIndex = headers.indexOf('URL');
    if (excess > 0 && urlIndex !== -1) {
      shrinkColumns(widths, [urlIndex], excess, MIN_WRAPPED_WIDTH);
      if (widths[urlIndex] < getNaturalWidth(rows, urlIndex)) {
        columns[urlIndex] = { width: widths[urlIndex], wrapWord: false };
      }
    }
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
