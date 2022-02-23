import { AuditLevel } from 'src/types';
import { printSecurityReport } from '../utils/print';
import { processAuditJson } from '../utils/vulnerability';

/**
 * Process and analyze the NPM audit JSON
 * @param  {String} jsonBuffer    NPM audit stringified JSON payload
 * @param  {Number} auditLevel    The level of vulnerabilities we care about
 * @param  {Array} exceptionIds   List of vulnerability IDs to exclude
 * @param  {Array} modulesToIgnore   List of vulnerable modules to ignore in audit results
 * @return {undefined}
 */
export default function handleFinish(jsonBuffer: string, auditLevel: AuditLevel, exceptionIds: number[], modulesToIgnore: string[]): void {
  const { unhandledIds, vulnerabilityIds, vulnerabilityModules, report, failed } = processAuditJson(
    jsonBuffer,
    auditLevel,
    exceptionIds,
    modulesToIgnore,
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

  // Grab any un-filtered vulnerabilities at the appropriate level
  const unusedExceptionIds = exceptionIds.filter((id) => !vulnerabilityIds.includes(id));
  const unusedIgnoredModules = modulesToIgnore.filter((moduleName) => !vulnerabilityModules.includes(moduleName));

  const messages = [
    `${unusedExceptionIds.length} of the excluded vulnerabilities did not match any of the found vulnerabilities: ${unusedExceptionIds.join(
      ', ',
    )}.`,
    `${unusedExceptionIds.length > 1 ? 'They' : 'It'} can be removed from the .nsprc file or --exclude -x flags.`,
  ];
  // Display the unused exceptionId's
  if (unusedExceptionIds.length) {
    if (unusedIgnoredModules.length) {
      messages.push(
        `${unusedIgnoredModules.length} of the ignored modules did not match any of the found vulnerabilites: ${unusedIgnoredModules.join(
          ', ',
        )}.`,
        `${unusedIgnoredModules.length > 1 ? 'They' : 'It'} can be removed from the --module-ignore -m flags.`,
      );
    }
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
    process.exit(0);
  }
}
