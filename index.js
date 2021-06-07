#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const { exec } = require('child_process');
const packageJson = require('./package');
const { isWholeNumber, mapLevelToNumber, getVulnerabilities, filterValidException } = require('./utils/common');
const { readFile } = require('./utils/file');
const consoleUtil = require('./utils/console');

const EXCEPTION_FILE_PATH = '.nsprc';
const BASE_COMMAND = 'npm audit';
const SEPARATOR = ',';
const DEFAULT_MESSSAGE_LIMIT = 100000; // characters
const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB
const RESPONSE_MESSAGE = {
  SUCCESS: '🤝  All good!',
  LOGS_EXCEEDED: '[MAXIMUM EXCEEDED] Logs exceeded the maximum length limit. Add the flag `-f` to see the full audit logs.',
};

/**
 * Handle the analyzed result and log display
 * @param  {Array} vulnerabilities  List of found vulerabilities
 * @param  {String} logData         Logs
 * @param  {Object} configs         Configurations
 */
function handleFinish(vulnerabilities, logData = '', configs = {}) {
  const {
    displayFullLog = false,
    maxLength = DEFAULT_MESSSAGE_LIMIT,
  } = configs;

  let toDisplay = logData.substring(0, maxLength);

  // Display an additional information if we not displaying the full logs
  if (toDisplay.length < logData.length) {
    toDisplay += '\n\n';
    toDisplay += '...';
    toDisplay += '\n\n';
    toDisplay += RESPONSE_MESSAGE.LOGS_EXCEEDED;
    toDisplay += '\n\n';
  }

  if (displayFullLog) {
    console.info(logData);
  } else {
    console.info(toDisplay);
  }

  // Display the error if found vulnerabilities
  if (vulnerabilities.length > 0) {
    consoleUtil.error(`${vulnerabilities.length} vulnerabilities found. Node security advisories: ${vulnerabilities}`);
    // Exit failed
    process.exit(1);
  } else {
    // Happy happy, joy joy
    consoleUtil.info(RESPONSE_MESSAGE.SUCCESS);
  }
}

/**
 * Re-runs the audit in human readable form
 * @param  {String} auditCommand    The NPM audit command to use (with flags)
 * @param  {Boolean} displayFullLog True if full log should be displayed in the case of no vulerabilities
 * @param  {Array} vulnerabilities  List of vulerabilities
 */
function auditLog(auditCommand, displayFullLog, vulnerabilities) {
  // Execute `npm audit` command again, but this time we don't use the JSON flag
  const audit = exec(auditCommand);

  // Set a temporary string
  // Note: collect all buffers' data before displaying it later to avoid unintentional line breaking in the report display
  let bufferData = '';

  audit.stdout.on('data', data => bufferData += data);

  // Once the stdout has completed
  audit.stderr.on('close', () => handleFinish(vulnerabilities, bufferData, { displayFullLog }));

  // stderr
  audit.stderr.on('data', console.error);
}

/**
 * Run the main Audit
 * @param  {String} auditCommand  The NPM audit command to use (with flags)
 * @param  {Number} auditLevel    The level of vulernabilities we care about
 * @param  {Boolean} fullLog      True if the full log should be displayed in the case of no vulerabilities
 * @param  {Array} exceptionIds   List of vulernability IDs to ignore
*/
function audit(auditCommand, auditLevel, fullLog, exceptionIds) {
  // Execute `npm audit` command to get the security report, taking into account
  // any additional flags that have been passed through. Using the JSON flag
  // to make this easier to process
  // NOTE: Increase max buffer size from default 1MB
  const audit = exec(`${auditCommand} --json`, { maxBuffer: MAX_BUFFER_SIZE });

  // Grab the data in chunks and buffer it as we're unable to parse JSON straight from stdout
  let jsonBuffer = '';
  audit.stdout.on('data', data => (jsonBuffer += data));

  // Once the stdout has completed process the output
  audit.stderr.on('close', () => {
    // Grab any un-filtered vunerablities at the appropriate level
    const vulnerabilities = getVulnerabilities(jsonBuffer, auditLevel, exceptionIds);

    // Display the original audit logs
    auditLog(auditCommand, fullLog, vulnerabilities);
  });

  // stderr
  audit.stderr.on('data', console.error);
}

/**
 * Handle user's input
 * @param  {Object} options     User's options or flags
 * @param  {Function} fn        The function to handle the inputs
 */
function handleUserInput(options, fn) {
  let auditCommand = BASE_COMMAND;
  let auditLevel = 0;
  let exceptionIds = [];
  let displayFullLog = false;

  // Check `.nsprc` file for exceptions
  const fileException = readFile(EXCEPTION_FILE_PATH);
  const filteredExceptions = filterValidException(fileException);
  if (fileException) {
    exceptionIds = filteredExceptions.map(details => details.id);
  }
  // Check also if any exception IDs passed via command flags
  if (options && options.ignore) {
    const cmdExceptions = options.ignore.split(SEPARATOR).filter(isWholeNumber).map(Number);
    exceptionIds = exceptionIds.concat(cmdExceptions);
  }
  if (Array.isArray(exceptionIds) && exceptionIds.length) {
    consoleUtil.info(`Exception vulnerabilities ID(s): ${exceptionIds}`);
  }
  if (options && options.displayNotes && filteredExceptions.length) {
    console.info(''); // Add some spacings
    console.info('Exceptions notes:');
    console.info('');
    filteredExceptions.forEach(({ id, reason }) => console.info(`${id}: ${reason || 'n/a'}`));
    console.info('');
  }
  if (options && options.level) {
    console.info(`[level: ${options.level}]`);
    auditLevel = mapLevelToNumber(options.level);
  }
  if (options && options.production) {
    console.info('[production mode enabled]');
    auditCommand += ' --production';
  }
  if (options && options.full) {
    console.info('[report display limit disabled]');
    displayFullLog = true;
  }

  fn(auditCommand, auditLevel, displayFullLog, exceptionIds);
}

program.version(packageJson.version);

program
    .command('audit')
    .description('execute npm audit')
    .option('-i, --ignore <ids>', 'Vulnerabilities ID(s) to ignore.')
    .option('-f, --full', `Display complete audit report. Limit to ${DEFAULT_MESSSAGE_LIMIT} characters by default.`)
    .option('-l, --level <auditLevel>', 'The minimum audit level to validate.')
    .option('-p, --production', 'Skip checking devDependencies.')
    .option('-d, --display-notes', 'Display exception notes.')
    .action(userOptions => handleUserInput(userOptions, audit));

program.parse(process.argv);

module.exports = {
  handleFinish,
  handleUserInput,
  BASE_COMMAND,
  SUCCESS_MESSAGE: RESPONSE_MESSAGE.SUCCESS,
  LOGS_EXCEEDED_MESSAGE: RESPONSE_MESSAGE.LOGS_EXCEEDED,
};
