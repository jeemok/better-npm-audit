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
 * Handle the analyzed result
 * @param  {Array} vulnerabilities  List of found vulerabilities
 */
function handleFinish(vulnerabilities) {
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
 * Handle the log display on user's console
 * @param  {String} data        String logs
 * @param  {Boolean} fullLog    If it should display all logs
 * @param  {Integer} maxLength  Maxiumum characters allowed to display
 */
function handleLogDisplay(data, fullLog, maxLength = DEFAULT_MESSSAGE_LIMIT) {
  if (fullLog) {
    consoleUtil.info(data);
  } else {
    const toDisplay = data.substring(0, maxLength);
    consoleUtil.info(toDisplay);

    // Display additional info if it is not the full message
    if (toDisplay.length < data.length) {
      consoleUtil.info('');
      consoleUtil.info('...');
      consoleUtil.info('');
      consoleUtil.info(RESPONSE_MESSAGE.LOGS_EXCEEDED);
      consoleUtil.info('');
    }
  }
}

/**
 * Re-runs the audit in human readable form
 * @param  {String} auditCommand    The NPM audit command to use (with flags)
 * @param  {Boolean} fullLog        True if the full log should be displayed in the case of no vulerabilities
 * @param  {Array} vulnerabilities  List of vulerabilities
 */
function auditLog(auditCommand, fullLog, vulnerabilities) {
  // Execute `npm audit` command again, but this time we don't use the JSON flag
  const audit = exec(auditCommand);

  audit.stdout.on('data', data => handleLogDisplay(data, fullLog));

  // Once the stdout has completed
  audit.stderr.on('close', () => handleFinish(vulnerabilities));

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
  let fullLog = false;

  // Try to use `.nsprc` file if it exists
  const fileException = readFile(EXCEPTION_FILE_PATH);
  if (fileException) {
    exceptionIds = filterValidException(fileException);
  }
  if (options && options.ignore) {
    const cmdExceptions = options.ignore.split(SEPARATOR).filter(isWholeNumber).map(Number);
    exceptionIds = exceptionIds.concat(cmdExceptions);
  }
  if (Array.isArray(exceptionIds) && exceptionIds.length) {
    consoleUtil.info('Exception vulnerabilities ID(s): ', exceptionIds);
  }
  if (options && options.level) {
    auditLevel = mapLevelToNumber(options.level);
  }
  if (options && options.production) {
    auditCommand += ' --production';
  }
  if (options && options.full) {
    fullLog = true;
  }

  fn(auditCommand, auditLevel, fullLog, exceptionIds);
}

program.version(packageJson.version);

program
    .command('audit')
    .description('execute npm audit')
    .option('-i, --ignore <ids>', 'Vulnerabilities ID(s) to ignore')
    .option('-f, --full', `Display the full audit logs. Default to ${DEFAULT_MESSSAGE_LIMIT} characters.`)
    .option('-l, --level <auditLevel>', 'The minimum audit level to include')
    .option('-p, --production', 'Skip checking devDependencies')
    .action(userOptions => handleUserInput(userOptions, audit));

program.parse(process.argv);

module.exports = {
  handleLogDisplay,
  handleFinish,
  handleUserInput,
  BASE_COMMAND,
  SUCCESS_MESSAGE: RESPONSE_MESSAGE.SUCCESS,
  LOGS_EXCEEDED_MESSAGE: RESPONSE_MESSAGE.LOGS_EXCEEDED,
};
