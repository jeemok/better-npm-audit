import { printSecurityReport, printScanReport } from '../utils/print';

/**
 * Handle final display
 * @param {Array} securityReport      Security report table data
 * @param {Array} scanReport          Scan report table data
 * @param {Array} unhandledIds        Unhandled reported vulnerability IDs
 * @param {Array} unusedExceptionIds  Unused exception IDs
 */
export default function handleDisplay(
  securityReport: string[][],
  scanReport: string[][],
  unhandledIds: number[],
  unusedExceptionIds: number[],
): void {
  // Print the security report
  if (securityReport.length) {
    printSecurityReport(securityReport);
  }

  // Display the unused exception IDs
  if (unusedExceptionIds.length) {
    const messages = [
      `${
        unusedExceptionIds.length
      } of the excluded vulnerabilities did not match any of the found vulnerabilities: ${unusedExceptionIds.join(', ')}.`,
      `${unusedExceptionIds.length > 1 ? 'They' : 'It'} can be removed from the .nsprc file or --exclude -x flags.`,
    ];
    console.warn(messages.join(' '));
  }

  // Display the scan report
  if (scanReport.length) {
    printScanReport(scanReport);
    console.info('The auto exclusion scanning is enabled by default, use `--scan-modules=false` to turn off this feature.');
  }

  // Display the found unhandled vulnerabilities
  if (unhandledIds.length) {
    console.error(`${unhandledIds.length} vulnerabilities found. Node security advisories: ${unhandledIds.join(', ')}`);
    // Exit failed
    process.exit(1);
  } else {
    // Happy happy, joy joy
    console.info('🤝  All good!');
  }
}
