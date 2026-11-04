import fs from 'fs';
import semver from 'semver';
import { AuditLevel, CommandOptions, NsprcFile } from 'src/types';
import { getNpmVersion } from '../utils/npm';
import { readFile, findNsprcModule, loadNsprcModule } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';
import { getExclusionPolicyErrors } from '../utils/exclusionPolicy';

/**
 * Validate registry URL to prevent command injection.
 * Uses an allowlist of characters (the audit command may run through a shell), then checks it parses as http(s).
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
 * Get the `npm audit` flag to skip the optional dependencies.
 * @return {String} The flag.
 */
function getSkipOptionalOption() {
  const npmVersion = getNpmVersion();
  if (semver.satisfies(npmVersion, '<=8.13.2')) {
    return '--no-optional';
  } else {
    return '--omit=optional';
  }
}

const PACKAGE_MANAGERS = ['npm', 'pnpm'];

/**
 * Work out which package manager's audit to run. An explicit `--package-manager` wins; otherwise a `pnpm-lock.yaml`
 * without an npm lockfile means pnpm, and anything else means npm.
 * @param  {String} requested   Value of `--package-manager`, if given
 * @return {String}             `npm` or `pnpm`
 */
export function getPackageManager(requested?: string): string {
  if (requested) {
    return requested;
  }
  const hasNpmLockfile = fs.existsSync('package-lock.json') || fs.existsSync('npm-shrinkwrap.json');
  return fs.existsSync('pnpm-lock.yaml') && !hasNpmLockfile ? 'pnpm' : 'npm';
}

/**
 * Get the audit command for production dependencies only, used for the `Scope` column.
 * @param  {String} auditCommand  The audit command that was built from the options
 * @return {String}               The command, or `undefined` if the audit command already covers production only
 */
export function getProductionAuditCommand(auditCommand: string): string | undefined {
  if (/(^| )(--prod|--production|--omit=dev)( |$)/.test(auditCommand)) {
    return undefined;
  }
  return auditCommand.startsWith('pnpm') ? `${auditCommand} --prod` : `${auditCommand} ${getProductionOnlyOption()}`;
}

/**
 * Handle user's input
 * @param  {Object} options     User's command options or flags
 * @param  {Function} fn        The function to handle the inputs
 */
export default function handleInput(
  options: CommandOptions,
  fn: (T1: string, T2: AuditLevel, T3: string[], T4: string[], T5: string[], T6?: AuditLevel, T7?: boolean) => void,
): void {
  // In JSON mode stdout carries only the JSON document, so all human-readable output goes to stderr
  if (options.json) {
    console.log = console.error;
    console.info = console.error;
  }

  // Validate registry URL if provided
  const registryOption = options.registry;
  if (registryOption && !validateRegistryUrl(registryOption)) {
    console.error('Error: Invalid registry URL. URL must be a valid http/https URL without shell metacharacters.');
    process.exit(1);
  }

  if (options.packageManager && !PACKAGE_MANAGERS.includes(options.packageManager)) {
    console.error(`Error: Unsupported package manager "${options.packageManager}". Use one of: ${PACKAGE_MANAGERS.join(', ')}.`);
    process.exit(1);
  }
  const packageManager = getPackageManager(options.packageManager);

  // Generate the audit command
  let auditCommand: string;
  if (packageManager === 'pnpm') {
    // pnpm audit reports in the same format as npm v6, and has no npm-version dependent flags
    auditCommand = [
      'pnpm audit',
      options.production ? '--prod' : '',
      options.skipOptional ? '--no-optional' : '',
      registryOption ? `--registry=${registryOption}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  } else {
    auditCommand = [
      'npm audit',
      options.production ? getProductionOnlyOption() : '',
      options.skipOptional ? getSkipOptionalOption() : '',
      registryOption ? `--registry=${registryOption}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

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

  // Get the exceptions, from a JavaScript module (possibly async) or the static `.nsprc` file
  const run = (nsprc: NsprcFile | boolean): void => {
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

    fn(auditCommand, auditLevel, exceptionIds, cmdModuleIgnore, cmdIncludeColumns, filterLevel, Boolean(options.json));
  };

  const nsprcModule = findNsprcModule();
  if (nsprcModule) {
    loadNsprcModule(nsprcModule).then(run);
  } else {
    run(readFile('.nsprc'));
  }
}
