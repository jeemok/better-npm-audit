import get from 'lodash.get';
import semver from 'semver';
import { AuditLevel, CommandOptions } from 'src/types';
import { getNpmVersion } from '../utils/npm';
import { readFile } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';

/**
 * Get the `npm audit` flag to audit only production dependencies.
 * @return {String} The flag.
 */
function getProductionOnlyOption() {
  const npmVersion = getNpmVersion();
  if (semver.satisfies(npmVersion, '<=8.13.2')) {
    return '--production';
  } else {
    return '--omit=dev';
  }
}
/**
 * Handle user's input
 * @param  {Object} options     User's command options or flags
 * @param  {Function} fn        The function to handle the inputs
 */
export default function handleInput(
  options: CommandOptions,
  fn: (T1: string, T2: AuditLevel, T3: string[], T4: string[], T5: string[], T6?: AuditLevel) => void,
): void {
  // Generate NPM Audit command
  const auditCommand: string = [
    'npm audit',
    // flags
    get(options, 'production') ? getProductionOnlyOption() : '',
    get(options, 'registry') ? `--registry=${options.registry}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Taking the audit level from the command or environment variable
  const envVar = process.env.NPM_CONFIG_AUDIT_LEVEL as AuditLevel;
  const auditLevel: AuditLevel = get(options, 'level', envVar) || 'info';

  // Process filter table option
  let filterLevel: AuditLevel | undefined;
  const filterTableOption = get(options, 'filterTable');
  if (filterTableOption) {
    if (typeof filterTableOption === 'string') {
      // User provided a specific level for filtering
      filterLevel = filterTableOption as AuditLevel;
    } else {
      // User provided true flag, use the audit level
      filterLevel = auditLevel;
    }
  }

  // Get the exceptions
  const nsprc = readFile('.nsprc');
  const cmdExceptions: string[] = get(options, 'exclude', '')
    .split(',')
    .map((each) => each.trim())
    .filter((each) => each !== '');
  const exceptionIds: string[] = getExceptionsIds(nsprc, cmdExceptions);
  const cmdModuleIgnore: string[] = get(options, 'moduleIgnore', '').split(',');
  const cmdIncludeColumns: string[] = get(options, 'includeColumns', '')
    .split(',')
    .map((each: string) => each.trim())
    .filter((each: string) => !!each);

  fn(auditCommand, auditLevel, exceptionIds, cmdModuleIgnore, cmdIncludeColumns, filterLevel);
}
