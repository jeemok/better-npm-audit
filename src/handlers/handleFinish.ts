import { AuditLevel } from 'src/types';
import { printSecurityReport, printMaintainerReport } from '../utils/print';
import { processAuditJson } from '../utils/vulnerability';

/**
 * Process and analyze the NPM audit JSON
 * @param  {String}   jsonBuffer          NPM audit stringified JSON payload
 * @param  {Number}   auditLevel          The level of vulnerabilities we care about
 * @param  {Array}    exceptionIds        List of vulnerability IDs to exclude
 * @param  {Boolean}  shouldScanModules   Flag if we should scan the node_modules
 * @return {undefined}
 */
export default function handleFinish(
  jsonBuffer: string,
  auditLevel: AuditLevel,
  exceptionIds: number[],
  shouldScanModules?: boolean,
): void {
  const { unhandledIds, vulnerabilityIds, report, maintainerReport, failed } = processAuditJson(
    jsonBuffer,
    auditLevel,
    exceptionIds,
    shouldScanModules,
  );

  // If unable to process the audit JSON
  if (failed) {
    console.error('Unable to process the JSON buffer string.');
    // Exit failed
    process.exit(1);
    return; // This seem unused but it is actually using in the test files to stop the process when we stubbing `process.exit()` above
  }

  // Print the security report
  if (report.length) {
    printSecurityReport(report);
  }

  // Grab any un-filtered vulnerabilities at the appropriate level
  const unusedExceptionIds = exceptionIds.filter((id) => !vulnerabilityIds.includes(id));

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

  // Display the auto excluded vulnerabilities
  if (maintainerReport.length) {
    printMaintainerReport(maintainerReport);
    console.info('The auto scanning and exclusion is enabled by default, use `--scan-modules=false` to turn off this feature.');
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
