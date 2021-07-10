import get from 'lodash.get';
import { AuditLevel, CommandOptions } from 'src/types';
import { isWholeNumber } from '../utils/common';
import { readFile } from '../utils/file';
import { getExceptionsIds } from '../utils/vulnerability';

/**
 * Handle user's input
 * @param  {Object} options     User's command options or flags
 * @param  {Function} fn        The function to handle the inputs
 */
export default function handleInput(options: CommandOptions, fn: (T1: string, T2: AuditLevel, T3: number[]) => void): void {
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

  // Get the exceptions
  const nsprc = readFile('.nsprc');
  const cmdExceptions: number[] = get(options, 'exclude', '').split(',').filter(isWholeNumber).map(Number);
  const exceptionIds: number[] = getExceptionsIds(nsprc, cmdExceptions);

  fn(auditCommand, auditLevel, exceptionIds);
}
