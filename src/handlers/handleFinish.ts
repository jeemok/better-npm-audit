import { AuditLevel } from 'src/types';
import { printSecurityReport } from '../utils/print';
import { processAuditJson } from '../utils/vulnerability';

/**
 * Process and analyze the NPM audit JSON
 * @param  {String} jsonBuffer    NPM audit stringified JSON payload
 * @param  {Number} auditLevel    The level of vulnerabilities we care about
 * @param  {Array} exceptionIds   List of vulnerability IDs to exclude
 * @return {undefined}
 */
export default function handleFinish(jsonBuffer: string, auditLevel: AuditLevel, exceptionIds: number[]): void {
  const { unhandledIds, vulnerabilityIds, report, failed } = processAuditJson(jsonBuffer, auditLevel, exceptionIds);

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

  // Grab any un-filtered vulnerabilities at the appropriate level
  const unusedExceptionIds = exceptionIds.filter((id) => !vulnerabilityIds.includes(id));

  // Display the unused exceptionId's
  if (unusedExceptionIds.length) {
    const messages = [
      `${
        unusedExceptionIds.length
      } of the excluded vulnerabilities did not match any of the found vulnerabilities: ${unusedExceptionIds.join(', ')}.`,
      `${unusedExceptionIds.length > 1 ? 'They' : 'It'} can be removed from the .nsprc file or --exclude -x flags.`,
    ];
    console.warn(messages.join(' '));
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
