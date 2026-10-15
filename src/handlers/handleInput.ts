import get from 'lodash.get';
import semver from 'semver';
import { AuditLevel, CommandOptions } from 'src/types';
import { getNpmVersion } from '../utils/npm';
import { readFile } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';
import dayjs from 'dayjs';

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

  if (options.exclude) {
    if (options.requireExpiry) {
      console.error('Exclusions have been set via the commandline without expiry dates, use .nsprc instead or disable requireExpiry');
      process.exit(1);
    }
    if (options.requireNotes) {
      console.error('Exclusions have been set via the commandline without without notes, use .nsprc instead or disable requireNotes');
      process.exit(1);
    }
  }

  // Get the exceptions
  const nsprc = readFile('.nsprc');

  if (nsprc && typeof nsprc === 'object') {
    const exclusions = Object.entries(nsprc);

    exclusions.forEach(([cve, exclusion]) => {
      if (typeof exclusion === 'string') {
        if (options.requireExpiry) {
          console.error(`Exclusion ${cve} in .nsprc is missing an expiry date`);
          process.exit(1);
        }
        if (options.requireNotes) {
          console.error(`Exclusion ${cve} in .nsprc is missing notes`);
          process.exit(1);
        }
      } else {
        if (options.requireExpiry && !exclusion.expiry) {
          console.error(`Exclusion ${cve} in .nsprc is missing an expiry date`);
          process.exit(1);
        }
        if (options.requireNotes && !exclusion.notes) {
          console.error(`Exclusion ${cve} in .nsprc is missing notes`);
          process.exit(1);
        }

        if (options.maxExpiryDays) {
          const dayjsNow = dayjs(Date.now());
          const dayjsMaxExpiryDate = dayjsNow.add(options.maxExpiryDays, 'day');

          if (dayjsMaxExpiryDate.isAfter(exclusion.expiry)) {
            console.error(
              `Exclusion ${cve} in .nsprc has an expiry too far in the future (maximum ${options.maxExpiryDays} days from today)`,
            );
            process.exit(1);
          }
        }
      }
    });
  }

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
