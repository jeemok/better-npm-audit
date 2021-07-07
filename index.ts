#!/usr/bin/env node

const get = require('lodash.get');
const program = require('commander');
const { exec } = require('child_process');
const packageJson = require('./package');

import { getExceptionsIds, processAuditJson } from 'utils/vulnerability';
import { printSecurityReport } from 'utils/print';
import { isWholeNumber } from 'utils/common';
import { readFile } from 'utils/file';

import { AuditLevel } from 'interfaces/level';
import { NsprcFile } from 'interfaces/nsprc';

const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB

/**
 * Process and analyze the NPM audit JSON
 * @param  {String} jsonBuffer    NPM audit stringified JSON payload
 * @param  {Number} auditLevel    The level of vulnerabilities we care about
 * @param  {Array} exceptionIds   List of vulnerability IDs to exclude
 * @return {undefined}
 */
export function handleFinish(jsonBuffer: string, auditLevel: AuditLevel, exceptionIds: number[]): void {
  const { unhandledIds, vulnerabilityIds, report, failed } = processAuditJson(jsonBuffer, auditLevel, exceptionIds);

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
  const unusedExceptionIds = exceptionIds.filter(id => !vulnerabilityIds.includes(id));

  // Display the unused exceptionId's
  if (unusedExceptionIds.length) {
    const messages = [
      `${unusedExceptionIds.length} of the excluded vulnerabilities did not match any of the found vulnerabilities: ${unusedExceptionIds.join(', ')}.`,
      `${unusedExceptionIds.length > 1 ? 'They' : 'It'} can be removed from the .nsprc file or --exclude -x flags.`,
    ];
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
  }
}

/**
 * Run audit
 * @param  {String} auditCommand  The NPM audit command to use (with flags)
 * @param  {Number} auditLevel    The level of vulnerabilities we care about
 * @param  {Array} exceptionIds   List of vulnerability IDs to exclude
*/
export function audit(auditCommand: string, auditLevel: AuditLevel, exceptionIds: number[]): void {
  // Increase the default max buffer size (1 MB)
  const audit = exec(`${auditCommand} --json`, { maxBuffer: MAX_BUFFER_SIZE });

  // Grab the data in chunks and buffer it as we're unable to parse JSON straight from stdout
  let jsonBuffer: string = '';

  audit.stdout.on('data', (data: string) => (jsonBuffer += data));

  // Once the stdout has completed, process the output
  audit.stderr.on('close', () => handleFinish(jsonBuffer, auditLevel, exceptionIds));

  // stderr
  audit.stderr.on('data', console.error);
}

/**
 * Handle user's input
 * @param  {Object} options     User's options or flags
 * @param  {Function} fn        The function to handle the inputs
 */
function handleAction(options: NsprcFile, fn: (T1: string, T2: AuditLevel, T3: number[]) => void) {
  // Generate NPM Audit command
  const auditCommand: string = [
    'npm audit',
    // flags
    get(options, 'production') ? '--production' : '',
  ].join(' ');

  // Taking the audit level from the command or environment variable
  const auditLevel = get(options, 'level', process.env.NPM_CONFIG_AUDIT_LEVEL) || 'info';

  // Get the exceptions
  const nsprc = readFile('.nsprc');
  const cmdExceptions: number[] = get(options, 'exclude', '').split(',').filter(isWholeNumber).map(Number);
  const exceptionIds: number[] = getExceptionsIds(nsprc, cmdExceptions);

  fn(auditCommand, auditLevel, exceptionIds);
}

program.version(packageJson.version);

program
  .command('audit')
  .description('execute npm audit')
  .option('-x, --exclude <ids>', 'Exceptions or the vulnerabilities ID(s) to exclude.')
  .option('-l, --level <auditLevel>', 'The minimum audit level to validate.')
  .option('-p, --production', 'Skip checking the devDependencies.')
  .action((options: NsprcFile) => handleAction(options, audit));

program.parse(process.argv);

module.exports = {
  handleFinish,
  handleAction,
};
