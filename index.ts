#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';

import { CommandOptions, ParsedCommandOptions } from 'src/types';

import handleInput from './src/handlers/handleInput';
import handleFinish from './src/handlers/handleFinish';

import packageJson from './package.json';

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
    audit.stderr.on('close', () => handleFinish(jsonBuffer, exceptionIds, options));
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
