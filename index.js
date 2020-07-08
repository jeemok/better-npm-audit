#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const { exec } = require('child_process');

const BASE_COMMAND = 'npm audit';
const SEPARATOR = ',';
const SPLIT_REGEX = /(https:\/\/(nodesecurity.io|npmjs.com)\/advisories\/)/;
const DIGIT_REGEX = /^\d+$/;
const DEFAULT_MESSSAGE_LIMIT = 100000; // characters

function isNumber(string) {
  return DIGIT_REGEX.test(string);
}

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

let userExceptionIds = [];

program
  .version('1.1.0')

program
  .command('audit')
  .description('execute npm audit')
  .option("-i, --ignore <ids>", 'Vulnerabilities ID(s) to ignore')
  .option("-f, --full", `Display the full audit logs. Default to ${DEFAULT_MESSSAGE_LIMIT} characters.`)
  .option("-p, --production", "Skip checking devDependencies")
  .action(function(options) {
    if (options && options.ignore) {
      userExceptionIds = options.ignore.split(SEPARATOR);
      console.info('Exception vulnerabilities ID(s): ', userExceptionIds);
    }

    let auditCommand = BASE_COMMAND;

    if (options && options.production) {
      auditCommand += " --production";
    }

    // Execute `npm audit` command to get the security report, taking into account
    // any additional flags that have been passed through
    const audit = exec(auditCommand);

    // stdout
    audit.stdout.on('data', data => {
      // Split the security report string by the URL at the end, and get the first 4 characters;
      // This might contains of other words than the IDs,
      // eg: ['===', 'http', 'node', '534', 'http', 'node', '118', 'http', 'node', '146', 'http', 'node', '975', 'http', 'node', '976']
      const rawIds = data.split(SPLIT_REGEX).map(str => str.substring(0, 4).trim());
      // Remove everything except for numbers from the array
      const numberIds = rawIds.filter(str => isNumber(str));
      // Remove duplicates
      const uniqueIds = numberIds.filter(unique);
      // Check if there is any more exceptions other than the user selected to ignore
      const vulnerabilities = uniqueIds.filter(id => (userExceptionIds.indexOf(id) === -1));
      // Throw error if we found more exceptions
      if (vulnerabilities.length > 0) {
        const message = `${vulnerabilities.length} vulnerabilities found. Node security advisories: ${vulnerabilities}`;
        throw new Error(message);
      }
      else {
        // If the display-all flag is passed in, display full audit logs
        if (options.full) {
          console.info(data);
        }
        // Otherwise, trim audit logs within the maximum characters limit
        else {
          const toDisplay = data.substring(0, DEFAULT_MESSSAGE_LIMIT);
          // Display into console
          console.info(toDisplay);
          // Display additional info if it is not the full message
          if (toDisplay.length < data.length) {
            console.info('');
            console.info('...');
            console.info('');
            console.info('[MAXIMUM EXCEEDED] Logs exceeded the maximum characters limit. Add the flag `-f` to see the full audit logs.');
            console.info('');
          }
        }
        // Happy happy, joy joy
        console.info('🤝  All good!');
      }
    });

    // stderr
    audit.stderr.on('data', data => {
      console.info(data);
    });
  });

program.parse(process.argv);
