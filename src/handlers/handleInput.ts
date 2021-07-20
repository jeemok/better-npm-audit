import get from 'lodash.get';
import { AuditLevel, CommandOptions, ParsedCommandOptions } from 'src/types';
import { isWholeNumber } from '../utils/common';
import { readFile } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';

/**
 * Process and clean user's input
 * @param  {Object} options     User's command options or flags
 * @param  {Function} fn        The function to handle the inputs
 */
export default function handleInput(options: CommandOptions, fn: (T1: string, T3: number[], T4: ParsedCommandOptions) => void): void {
  // Generate NPM Audit command
  const auditCommand: string = [
    'npm audit',
    // flags
    get(options, 'production') ? '--production' : '',
    get(options, 'registry') ? `--registry=${options.registry}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Taking the audit level from the command or environment variable
  const envVar = process.env.NPM_CONFIG_AUDIT_LEVEL as AuditLevel;
  const auditLevel: AuditLevel = get(options, 'level', envVar) || 'info';

  const parsedOptions: ParsedCommandOptions = {
    ...options,
    level: auditLevel,
    scanModules: options.scanModules !== 'false',
  };

  // Get the exceptions
  const nsprc = readFile('.nsprc');
  const cmdExceptions: number[] = get(options, 'exclude', '').split(',').filter(isWholeNumber).map(Number);
  const exceptionIds: number[] = getExceptionsIds(nsprc, cmdExceptions);

  fn(auditCommand, exceptionIds, parsedOptions);
}
