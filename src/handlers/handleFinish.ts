import { AuditLevel, AuditContext } from 'src/types';
import { readLockfilePackages } from '../utils/file';
import { printSecurityReport } from '../utils/print';
import { processAuditJson, handleUnusedExceptions, parseModulePattern } from '../utils/vulnerability';

/**
 * Write a JSON document to stdout, then exit once it has been flushed
 * @param  {Object} payload   The document
 * @param  {Number} exitCode  Process exit code
 */
function writeJson(payload: Record<string, unknown>, exitCode: number): void {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`, () => process.exit(exitCode));
}

/**
 * Gather the extra data that some options need
 * @param  {Array}  exceptionModules  The `--module-ignore` patterns
 * @param  {String} prodJsonBuffer    NPM audit JSON of the production dependencies only, if the `Scope` column was requested
 * @param  {Array} ignoreDependenciesOf Packages whose dependency subtree is ignored
 * @return {Object}                   The audit context
 */
function getContext(exceptionModules: string[], prodJsonBuffer?: string, ignoreDependenciesOf: string[] = []): AuditContext {
  const context: { -readonly [K in keyof AuditContext]: AuditContext[K] } = { ignoreDependenciesOf };
  // Only versioned module patterns (e.g. `pkg@1.2.3`) need the installed versions
  if (exceptionModules.some((pattern) => parseModulePattern(pattern).range !== undefined)) {
    context.lockfilePackages = readLockfilePackages();
  }
  if (prodJsonBuffer !== undefined) {
    const prod = processAuditJson(prodJsonBuffer);
    if (prod.failed) {
      console.error('Unable to process the production-only audit, so the Scope column will show N/A.');
    } else {
      context.prodVulnerabilityIds = prod.vulnerabilityIds;
    }
  }
  return context;
}

/**
 * Process and analyze the NPM audit JSON
 * @param  {String} jsonBuffer        NPM audit stringified JSON payload
 * @param  {Number} auditLevel        The level of vulnerabilities we care about
 * @param  {Array} exceptionIds       List of vulnerability IDs to exclude
 * @param  {Array} exceptionModules   List of vulnerable modules to ignore in audit results
 * @param  {Array} columnsToInclude   List of columns to include in audit results
 * @param  {String} filterLevel       Optional level to filter table display
 * @param  {Boolean} outputJson       Print the result as a JSON document on stdout
 * @param  {String} prodJsonBuffer    NPM audit JSON of the production dependencies only (for the `Scope` column)
 * @param  {Array} ignoreDependenciesOf Packages whose dependency subtree is ignored
 */
export default function handleFinish(
  jsonBuffer: string,
  auditLevel: AuditLevel,
  exceptionIds: string[],
  exceptionModules: string[],
  columnsToInclude: string[],
  filterLevel?: AuditLevel,
  outputJson = false,
  prodJsonBuffer?: string,
  ignoreDependenciesOf: string[] = [],
): void {
  const { unhandledIds, report, vulnerabilities, failed, unusedExceptionIds, unusedExceptionModules } = processAuditJson(
    jsonBuffer,
    auditLevel,
    exceptionIds,
    exceptionModules,
    columnsToInclude,
    filterLevel,
    getContext(exceptionModules, prodJsonBuffer, ignoreDependenciesOf),
  );

  // If unable to process the audit JSON
  if (failed) {
    console.error('Unable to process the JSON buffer string.');
    if (jsonBuffer.trim()) {
      console.error(
        '`npm audit --json` returned output that is not valid JSON. Check the message above, and that your registry is reachable.',
      );
    } else {
      console.error(
        '`npm audit --json` returned no output. Check the message above, that a lockfile exists, and that the registry is reachable.',
      );
    }
    // Exit failed
    if (outputJson) {
      writeJson({ passed: false, error: 'Unable to process the `npm audit --json` output.' }, 1);
    } else {
      process.exit(1);
    }
    return;
  }

  if (outputJson) {
    const bySeverity: Record<string, number> = {};
    vulnerabilities.forEach(({ severity }) => (bySeverity[severity] = (bySeverity[severity] || 0) + 1));
    // Human-readable output (table, unused exceptions) still goes to stderr
    if (report.length) {
      printSecurityReport(report, columnsToInclude);
    }
    handleUnusedExceptions(unusedExceptionIds, unusedExceptionModules);
    writeJson(
      {
        passed: unhandledIds.length === 0,
        auditLevel,
        summary: { total: vulnerabilities.length, unhandled: unhandledIds.length, bySeverity },
        unhandledIds,
        unusedExceptionIds,
        unusedExceptionModules: unusedExceptionModules.filter(Boolean),
        vulnerabilities,
      },
      unhandledIds.length ? 1 : 0,
    );
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
