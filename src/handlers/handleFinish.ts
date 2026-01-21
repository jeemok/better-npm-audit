import { AuditLevel } from 'src/types';
import { printSecurityReport } from '../utils/print';
import { processAuditJson, handleUnusedExceptions } from '../utils/vulnerability';

/**
 * Process and analyze the NPM audit JSON
 * @param  {String} jsonBuffer        NPM audit stringified JSON payload
 * @param  {Number} auditLevel        The level of vulnerabilities we care about
 * @param  {Array} exceptionIds       List of vulnerability IDs to exclude
 * @param  {Array} exceptionModules   List of vulnerable modules to ignore in audit results
 * @param  {Array} columnsToInclude   List of columns to include in audit results
 * @param  {String} filterLevel       Optional level to filter table display
 */
export default function handleFinish(
  jsonBuffer: string,
  auditLevel: AuditLevel,
  exceptionIds: string[],
  exceptionModules: string[],
  columnsToInclude: string[],
  filterLevel?: AuditLevel,
): void {
  const { unhandledIds, report, failed, unusedExceptionIds, unusedExceptionModules } = processAuditJson(
    jsonBuffer,
    auditLevel,
    exceptionIds,
    exceptionModules,
    columnsToInclude,
    filterLevel,
  );

  // If unable to process the audit JSON
  if (failed) {
    console.error('Unable to process the JSON buffer string.');
    // Exit failed
    process.exit(1);
    return;
  }

  // Print the security report
  if (report.length) {
    printSecurityReport(report, columnsToInclude);
  }

  // Handle unused exceptions
  handleUnusedExceptions(unusedExceptionIds, unusedExceptionModules);

  // Display the found unhandled vulnerabilities
  if (unhandledIds.length) {
    console.error(`${unhandledIds.length} vulnerabilities found. Node security advisories: ${unhandledIds.join(', ')}`);
    // Exit failed
    process.exit(1);
  } else {
    // Happy happy, joy joy
    console.info('🤝  All good!');
    process.exit(0);
  }
}
