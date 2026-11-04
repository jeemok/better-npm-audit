import semver from 'semver';
import { AuditLevel, CommandOptions } from 'src/types';
import { getNpmVersion } from '../utils/npm';
import { readFile } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';
import { getExclusionPolicyErrors } from '../utils/exclusionPolicy';

/**
 * Validate registry URL to prevent command injection.
 * Uses an allowlist of characters (the audit command is run through a shell), then checks it parses as http(s).
 * @param {string} url - The registry URL to validate
 * @return {boolean} True if valid URL, false otherwise
 */
export function validateRegistryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Only characters that are safe in a shell and legal in a URL
  if (!/^[A-Za-z0-9\-._~:/?#@%+=,]+$/.test(url)) {
    return false;
  }

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
  const registryOption = options.registry;
  if (registryOption && !validateRegistryUrl(registryOption)) {
    console.error('Error: Invalid registry URL. URL must be a valid http/https URL without shell metacharacters.');
    process.exit(1);
  }

  // Generate NPM Audit command
  const auditCommand: string = [
    'npm audit',
    // flags
    options.production ? getProductionOnlyOption() : '',
    registryOption ? `--registry=${registryOption}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Taking the audit level from the command or environment variable
  const envVar = process.env.NPM_CONFIG_AUDIT_LEVEL as AuditLevel;
  const auditLevel: AuditLevel = options.level || envVar || 'info';

  // Process filter table option
  let filterLevel: AuditLevel | undefined;
  const filterTableOption = options.filterTable;
  if (filterTableOption) {
    if (typeof filterTableOption === 'string') {
      // User provided a specific level for filtering
      filterLevel = filterTableOption as AuditLevel;
    } else {
      // User provided true flag, use the audit level
      filterLevel = auditLevel;
    }
  }

  if (options.exclude) {
    if (options.requireExpiry) {
      console.error('Exclusions have been set via the commandline without expiry dates, use .nsprc instead or disable requireExpiry');
      process.exit(1);
    }
    if (options.requireNotes) {
      console.error('Exclusions have been set via the commandline without notes, use .nsprc instead or disable requireNotes');
      process.exit(1);
    }
  }

  // Get the exceptions
  const nsprc = readFile('.nsprc');

  if (nsprc && typeof nsprc === 'object') {
    const errors = getExclusionPolicyErrors(nsprc as Record<string, unknown>, options);
    if (errors.length) {
      errors.forEach((error) => console.error(error));
      process.exit(1);
    }
  }

  const cmdExceptions: string[] = (options.exclude ?? '')
    .split(',')
    .map((each) => each.trim())
    .filter((each) => each !== '');
  const exceptionIds: string[] = getExceptionsIds(nsprc, cmdExceptions);
  const cmdModuleIgnore: string[] = (options.moduleIgnore ?? '').split(',');
  const cmdIncludeColumns: string[] = (options.includeColumns ?? '')
    .split(',')
    .map((each: string) => each.trim())
    .filter((each: string) => !!each);

  fn(auditCommand, auditLevel, exceptionIds, cmdModuleIgnore, cmdIncludeColumns, filterLevel);
}
