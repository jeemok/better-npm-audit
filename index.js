#!/usr/bin/env node

/**
 * Module dependencies.
 */

const get = require('lodash.get');
const program = require('commander');
const { exec } = require('child_process');
const packageJson = require('./package');

const { getExceptionsIds, processAuditJson } = require('./utils/vulnerability');
const { printSecurityReport } = require('./utils/print');
const { isWholeNumber } = require('./utils/common');
const { readFile } = require('./utils/file');

const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB

/**
 * Process and analyze the NPM audit JSON
 * @param {String} jsonBuffer     NPM audit stringified JSON payload
 * @param  {Number} auditLevel    The level of vulnerabilities we care about
 * @param  {Array} exceptionIds   List of vulnerability IDs to exclude
 * @return {undefined}
 */
function handleFinish(jsonBuffer, auditLevel, exceptionIds) {
  const { unhandledIds, vulnerabilityIds, report } = processAuditJson(jsonBuffer, auditLevel, exceptionIds);

  // If unable to process the audit JSON
  if (!Array.isArray(unhandledIds) || !Array.isArray(vulnerabilityIds) || !Array.isArray(report)) {
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
function audit(auditCommand, auditLevel, exceptionIds) {
  // Increase the default max buffer size (1 MB)
  const audit = exec(`${auditCommand} --json`, { maxBuffer: MAX_BUFFER_SIZE });

  // Grab the data in chunks and buffer it as we're unable to parse JSON straight from stdout
  let jsonBuffer = '';

  audit.stdout.on('data', data => (jsonBuffer += data));

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
function handleAction(options, fn) {
  // Generate NPM Audit command
  const auditCommand = [
    'npm audit',
    // flags
    get(options, 'production') ? '--production' : '',
    get(options, 'registry') ? `--registry=${options.registry}` : '',
  ].filter(Boolean).join(' ');

  // Taking the audit level from the command or environment variable
  const auditLevel = get(options, 'level', process.env.NPM_CONFIG_AUDIT_LEVEL) || 'info';

  // Get the exceptions
  const nsprc = readFile('.nsprc');
  const cmdExceptions = get(options, 'exclude', '').split(',').filter(isWholeNumber).map(Number);
  const exceptionIds = getExceptionsIds(nsprc, cmdExceptions);

  fn(auditCommand, auditLevel, exceptionIds);
}

program.version(packageJson.version);

program
    .command('audit')
    .description('execute npm audit')
    .option('-x, --exclude <ids>', 'Exceptions or the vulnerabilities ID(s) to exclude.')
    .option('-l, --level <auditLevel>', 'The minimum audit level to validate.')
    .option('-p, --production', 'Skip checking the devDependencies.')
    .option('-r, --registry <url>', 'The npm registry url to use.')
    .action(options => handleAction(options, audit));

program.parse(process.argv);

module.exports = {
  handleFinish,
  handleAction,
};
