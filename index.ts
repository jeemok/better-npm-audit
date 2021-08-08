#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';

import { CommandOptions, ParsedCommandOptions } from 'src/types';

import handleInput from './src/handlers/handleInput';
import handleDisplay from './src/handlers/handleDisplay';

import packageJson from './package.json';
import handleAudit from './src/handlers/handleAudit';
import handleScanV7 from './src/handlers/handleScanV7';

const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB
const program = new Command();

/**
 * Run audit
 * @param  {String}  auditCommand       The NPM audit command to use (with flags)
 * @param  {Array}   exceptionIds       List of vulnerability IDs to exclude
 * @param  {Object}  options            Parsed command options
 * @param  {Boolean} shouldScanModules  Flag if we should scan the node_modules
 */
export function callback(auditCommand: string, exceptionIds: number[], options: ParsedCommandOptions): void {
  // Increase the default max buffer size (1 MB)
  const audit = exec(`${auditCommand} --json`, { maxBuffer: MAX_BUFFER_SIZE });

  // Grab the data in chunks and buffer it as we're unable to parse JSON straight from stdout
  let jsonBuffer = '';

  if (audit.stdout) {
    audit.stdout.on('data', (data: string) => (jsonBuffer += data));
  }

  // Once the stdout has completed, process the output
  if (audit.stderr) {
    audit.stderr.on('close', () => {
      // Analyze the npm audit response
      const { unhandledIds, vulnerabilityIds, report, scanModules, npmVersion } = handleAudit(jsonBuffer, exceptionIds, options);

      // Grab any un-filtered vulnerabilities at the appropriate level
      const unusedExceptionIds = exceptionIds.filter((id) => !vulnerabilityIds.includes(id));

      // Make additional round of scanning the internal modules.
      // The reason to do this outside of the above was to keep it cleaner to manage the code
      // as npm v7 audit does not provide information of the installed version, we have to
      // retrieve that information from the `package.json` file, so we could check the
      // dependent modules via `npm ls {module}@{version}` properly.
      if (!options.scanModules) {
        // Display report
        handleDisplay(report, [], unhandledIds, unusedExceptionIds);
        return;
      }

      // If unable to determine the npm version
      if (npmVersion !== 6 && npmVersion !== 7) {
        console.error('Unable to determine NPM version from the audit response');
        // Exit failed
        process.exit(1);
      }

      if (npmVersion === 6) {
        // TODO: Add auto exclusion scanning
        handleDisplay(report, [], unhandledIds, unusedExceptionIds);
      }

      if (npmVersion === 7) {
        // Scanning dependent modules
        handleScanV7(scanModules, report, unhandledIds, options, (error, response) => {
          if (error) {
            console.error(error);
            // Exit failed
            process.exit(1);
          }
          // Display report
          handleDisplay(response.securityReport, response.scanReport, response.unhandledIds, unusedExceptionIds);
        });
      }
    });
    // stderr
    audit.stderr.on('data', console.error);
  }
}

program.name(packageJson.name).version(packageJson.version);

program
  .command('audit')
  .description('execute npm audit')
  .option('-x, --exclude <ids>', 'Exceptions or the vulnerabilities ID(s) to exclude.')
  .option('-l, --level <auditLevel>', 'The minimum audit level to validate.')
  .option('-p, --production', 'Skip checking the devDependencies.')
  .option('-r, --registry <url>', 'The npm registry url to use.')
  .option('-s, --scan-modules [boolean]', 'Scan through reported modules for .nsprc file.', true)
  .option('-d, --debug', 'Enable debug mode.')
  .action((options: CommandOptions) => handleInput(options, callback));

program.parse(process.argv);
