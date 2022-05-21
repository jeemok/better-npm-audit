#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';

import { AuditLevel, CommandOptions } from 'src/types';

import handleInput from './src/handlers/handleInput';
import handleFinish from './src/handlers/handleFinish';

import packageJson from './package.json';

const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB
const program = new Command();

/**
 * Run audit
 * @param  {String} auditCommand    The NPM audit command to use (with flags)
 * @param  {String} auditLevel      The level of vulnerabilities we care about
 * @param  {Array}  exceptionIds    List of vulnerability IDs to exclude
 * @param  {Array} modulesToIgnore   List of vulnerable modules to ignore in audit results
 */
export function callback(auditCommand: string, auditLevel: AuditLevel, exceptionIds: string[], modulesToIgnore: string[]): void {
  // Increase the default max buffer size (1 MB)
  const audit = exec(`${auditCommand} --json`, { maxBuffer: MAX_BUFFER_SIZE });

  // Grab the data in chunks and buffer it as we're unable to parse JSON straight from stdout
  let jsonDevBuffer = '';
  let jsonProdBuffer = '';

  if (audit.stdout) {
    audit.stdout.on('data', (data: string) => (jsonDevBuffer += data));
  }

  // Once the stdout has completed, process the output
  if (audit.stderr) {
    audit.stderr.on('close', () => {
      console.log('first call');
      const auditProd = exec(`npm audit --production --json`, { maxBuffer: MAX_BUFFER_SIZE });
      if (auditProd.stderr) {
        if (auditProd.stdout) {
          auditProd.stdout.on('data', (data: string) => (jsonProdBuffer += data));
        }
        auditProd.stderr.on('close', () => {
          // console.log(jsonBuffer);
          // console.log('===============================================');
          // console.log(jsonProdBuffer);
          // jsonDevBuffer
          handleFinish(jsonProdBuffer, jsonDevBuffer, auditLevel, exceptionIds, modulesToIgnore);
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
  .option('-m, --module-ignore <moduleNames>', 'Names of modules to ignore.')
  .option('-l, --level <auditLevel>', 'The minimum audit level to validate.')
  .option('-p, --production', 'Skip checking the devDependencies.')
  .option('-r, --registry <url>', 'The npm registry url to use.')
  .action((options: CommandOptions) => handleInput(options, callback));

program.parse(process.argv);
