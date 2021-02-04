#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const { exec } = require('child_process');
const packageJson = require('./package');

const BASE_COMMAND = 'npm audit';
const SEPARATOR = ',';
const DEFAULT_MESSSAGE_LIMIT = 100000; // characters
const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB

/**
 * Converts an audit level to a numeric value for filtering purposes
 * @param  {String} auditLevel  The npm audit level
 * @return {Number}             The numeric value, higher is more severe
 */
function mapLevelToNumber(auditLevel) {
  switch (auditLevel) {
    case 'low':
      return 1;
    case 'moderate':
      return 2;
    case 'high':
      return 3;
    case 'critical':
      return 4;
    default:
      return 0;
  }
}

/**
 * Re-runs the audit in human readable form
 * @param  {String} auditCommand  The NPM audit command to use (with flags)
 * @param  {Boolean} fullLog      True if the full log should be displayed in the case of no vulerabilities
 */
function auditLog(auditCommand, fullLog, vulnerabilities) {
  // Execute `npm audit` command again, but this time we don't use the JSON flag
  const audit = exec(auditCommand);

  audit.stdout.on('data', data => {
    if (fullLog) {
      console.info(data);
    } else {
      const toDisplay = data.substring(0, DEFAULT_MESSSAGE_LIMIT);
      console.info(toDisplay);

      // Display additional info if it is not the full message
      if (toDisplay.length < data.length) {
        console.info('');
        console.info('...');
        console.info('');
        console.info('[MAXIMUM EXCEEDED] Logs exceeded the maximum length limit. Add the flag `-f` to see the full audit logs.');
        console.info('');
      }
    }
  });

  // Once the stdout has completed
  audit.stderr.on('close', () => {
    // Display the error if found vulnerabilities
    if (vulnerabilities.length > 0) {
      const message = `${vulnerabilities.length} vulnerabilities found. Node security advisories: ${vulnerabilities}`;
      throw new Error(message);
    } else {
      // Happy happy, joy joy
      console.info('🤝  All good!');
    }
  });

  // stderr
  audit.stderr.on('data', data => {
    console.error(data);
  });
}

/**
 * Run the main Audit
 * @param  {String} auditCommand  The NPM audit command to use (with flags)
 * @param  {Number} auditLevel    The level of vulernabilities we care about
 * @param  {Boolean} fullLog      True if the full log should be displayed in the case of no vulerabilities
 */
function audit(auditCommand, auditLevel, fullLog) {
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
    const { advisories } = JSON.parse(jsonBuffer);

    // Grab any un-filtered vunerablities at the appropriate level
    const vulnerabilities = Object.values(advisories || {})
      .filter(advisory => mapLevelToNumber(advisory.severity) >= auditLevel)
      .map(advisory => advisory.id)
      .filter(id => userExceptionIds.indexOf(id) === -1);

    // Display the original audit logs
    auditLog(auditCommand, fullLog, vulnerabilities);
  });

  // stderr
  audit.stderr.on('data', data => {
    console.error(data);
  });
}

let userExceptionIds = [];

program.version(packageJson.version);

program
  .command('audit')
  .description('execute npm audit')
  .option('-i, --ignore <ids>', 'Vulnerabilities ID(s) to ignore')
  .option('-f, --full', `Display the full audit logs. Default to ${DEFAULT_MESSSAGE_LIMIT} characters.`)
  .option('-l, --level <auditLevel>', 'The minimum audit level to include')
  .option('-p, --production', 'Skip checking devDependencies')
  .action(function (options) {
    if (options && options.ignore) {
      userExceptionIds = options.ignore.split(SEPARATOR).map(Number);
      console.info('Exception vulnerabilities ID(s): ', userExceptionIds);
    }

    // Grab the audit level passed in, or all by default
    let auditLevel = 0;
    if (options && options.level) {
      auditLevel = mapLevelToNumber(options.level);
    }

    // Modify the audit command to only include production
    let auditCommand = BASE_COMMAND;
    if (options && options.production) {
      auditCommand += ' --production';
    }

    audit(auditCommand, auditLevel, options.full);
  });

program.parse(process.argv);
