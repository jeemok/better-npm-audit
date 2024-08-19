import { AuditLevel } from 'src/types';
import { printSecurityReport } from '../utils/print';
import { processAuditJson, handleUnusedExceptions } from '../utils/vulnerability';
/**
 * Process and analyze the NPM audit JSON
 * @param  {String} jsonProdBuffer        NPM audit production dependencies stringified JSON payload
 * @param  {String} jsonDevBuffer         NPM audit developer dependencies stringified JSON payload
 * @param  {Number} auditLevel        The level of vulnerabilities we care about
 * @param  {Array} exceptionIds       List of vulnerability IDs to exclude
 * @param  {Array} exceptionModules   List of vulnerable modules to ignore in audit results
 */
export default function handleFinish(
  jsonProdBuffer: string,
  jsonDevBuffer: string,
  auditLevel: AuditLevel,
  exceptionIds: string[],
  exceptionModules: string[],
): void {
  const { unhandledIds, report, failed, unusedExceptionIds, unusedExceptionModules } = processAuditJson(
    jsonProdBuffer,
    jsonDevBuffer,
    auditLevel,
    exceptionIds,
    exceptionModules,
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
    printSecurityReport(report);
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
