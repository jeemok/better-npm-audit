#!/usr/bin/env node

/**
 * Module dependencies.
 */

let program = require('commander');
let { exec } = require('child_process');

const AUDIT_COMMAND = 'npm audit';
const SPLIT_STRING = 'https://nodesecurity.io/advisories/';

let exceptionIds = [];

program
  .version('0.1.0')

program
  .command('audit')
  .description('execute npm audit')
  .option("-i, --ignore <ids>", "Vulnerabilities IDs to ignore")
  .action(function(options) {
    if (options && options.ignore) {
      exceptionIds = options.ignore.split(',');
      console.log('Exception Vulnerabilities IDs: ', exceptionIds);
    }

    const audit = exec(AUDIT_COMMAND);

    // stdout
    audit.stdout.on('data', data => {
      const ids = data.split(SPLIT_STRING).map(str => str.substring(0, 4).trim());

      const numberIds = ids.map(id => {
        if (isNaN(parseInt(id, 10))) {
          return null;
        }
        return id;
      }).filter(Boolean);

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

      const uniqueIds = numberIds.filter(onlyUnique);

      // Get the vulnerabilities, ignore the exceptions
      const vulnerabilities = uniqueIds.filter(id => (exceptionIds.indexOf(id) === -1));

      if (vulnerabilities.length > 0) {
        throw new Error(`${vulnerabilities.length} vulnerabilities found. Node security advisories: ${vulnerabilities}`);
      }
      else {
        console.log(data);
        console.log('🤝  All good!');
      }
    });

    // stderr
    audit.stderr.on('data', data => {
      console.log(data);
    });
  });

program.parse(process.argv);
