import get from 'lodash.get';
import semver from 'semver';
import { AuditLevel, CommandOptions } from 'src/types';
import { getNpmVersion } from '../utils/npm';
import { readFile } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';

/**
 * Validate registry URL to prevent command injection
 * @param {string} url - The registry URL to validate
 * @return {boolean} True if valid URL, false otherwise
 */
function validateRegistryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check for shell metacharacters that could enable command injection
  const dangerousPatterns = /[;|&`$(){}[\]<>\n\r]/;
  if (dangerousPatterns.test(url)) {
    return false;
  }

  // Validate as proper URL
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

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
  // Validate registry URL if provided
  const registryOption = get(options, 'registry');
  if (registryOption && !validateRegistryUrl(registryOption)) {
    console.error('Error: Invalid registry URL. URL must be a valid http/https URL without shell metacharacters.');
    process.exit(1);
  }

  // Generate NPM Audit command
  const auditCommand: string = [
    'npm audit',
    // flags
    get(options, 'production') ? getProductionOnlyOption() : '',
    registryOption ? `--registry=${registryOption}` : '',
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
