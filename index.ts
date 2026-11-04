#!/usr/bin/env node

import { Command } from 'commander';
import { execFile } from 'child_process';

import { AuditLevel, CommandOptions } from 'src/types';

import handleInput, { getProductionAuditCommand } from './src/handlers/handleInput';
import handleFinish from './src/handlers/handleFinish';

import packageJson from './package.json';

const MAX_BUFFER_SIZE = 1024 * 1000 * 50; // 50 MB
const program = new Command();

/**
 * Run audit
 * @param  {String} auditCommand    The NPM audit command to use (with flags)
 * @param  {String} auditLevel      The level of vulnerabilities we care about
 * @param  {Array}  exceptionIds    List of vulnerability IDs to exclude
 * @param  {Array} modulesToIgnore  List of vulnerable modules to ignore in audit results
 * @param  {Array} columnsToInclude List of columns to include in audit results
 * @param  {String} filterLevel     Optional level to filter table display
 * @param  {Boolean} outputJson     Print the result as a JSON document on stdout
 * @param  {Array} ignoreDependenciesOf Packages whose dependency subtree is ignored
 */
export function callback(
  auditCommand: string,
  auditLevel: AuditLevel,
  exceptionIds: string[],
  modulesToIgnore: string[],
  columnsToInclude: string[],
  filterLevel?: AuditLevel,
  outputJson?: boolean,
  ignoreDependenciesOf: string[] = [],
): void {
  const finish = (jsonBuffer: string, prodJsonBuffer?: string) =>
    handleFinish(
      jsonBuffer,
      auditLevel,
      exceptionIds,
      modulesToIgnore,
      columnsToInclude,
      filterLevel,
      outputJson,
      prodJsonBuffer,
      ignoreDependenciesOf,
    );

  runAudit(auditCommand, true, (jsonBuffer) => {
    if (!columnsToInclude.includes('Scope')) {
      return finish(jsonBuffer);
    }
    // The `Scope` column needs a second audit of the production dependencies only
    const prodCommand = getProductionAuditCommand(auditCommand);
    if (!prodCommand) {
      return finish(jsonBuffer, jsonBuffer);
    }
    runAudit(prodCommand, false, (prodJsonBuffer) => finish(jsonBuffer, prodJsonBuffer));
  });
}

/**
 * Run an audit command and hand over its JSON output
 * @param  {String}   auditCommand  The audit command (without `--json`)
 * @param  {Boolean}  showStderr    Whether to show the command's stderr (off for the second, production-only run)
 * @param  {Function} onDone        Called with the JSON string buffer once the command has finished
 */
function runAudit(auditCommand: string, showStderr: boolean, onDone: (jsonBuffer: string) => void): void {
  // Increase the default max buffer size (1 MB)
  // Run npm directly without a shell, so no argument can be interpreted as a shell command.
  // Windows needs a shell to run `npm.cmd`; the only user-provided argument (the registry URL) is allowlist-validated.
  const [command, ...args] = `${auditCommand} --json`.split(' ');
  const audit = execFile(command, args, { maxBuffer: MAX_BUFFER_SIZE, shell: process.platform === 'win32' });

  // Grab the data in chunks and buffer it as we're unable to parse JSON straight from stdout
  let jsonBuffer = '';

  if (audit.stdout) {
    audit.stdout.on('data', (data: string) => (jsonBuffer += data));
  }

  // Once the stdout has completed, process the output
  if (audit.stderr) {
    audit.stderr.on('close', () => onDone(jsonBuffer));
    // stderr
    audit.stderr.on('data', (data: string) => {
      if (showStderr) {
        console.error(data);
      }
    });
  }

  // Failed to even start the package manager (e.g. not installed or not on the PATH)
  audit.on('error', (error: Error) => {
    console.error(`Unable to run \`${command}\`: ${error.message}`);
    process.exit(1);
  });
}

program.name(packageJson.name).version(packageJson.version);

program
  .command('audit')
  .description('execute npm audit (or pnpm audit)')
  .option('-x, --exclude <ids>', 'Exceptions or the vulnerabilities ID(s) to exclude.')
  .option('--max-expiry-days <days>', 'Fails the audit if an exclusion expires more than this many days in the future')
  .option('--require-notes', 'Fails audit if exclusions do not have a note')
  .option('--require-expiry', 'Fails audit if exclusions do not have an expiry date')
  .option('-m, --module-ignore <moduleNames>', 'Names of modules to ignore.')
  .option(
    '--ignore-dependencies-of <packageNames>',
    'Ignore vulnerabilities in modules that are only installed through these packages (comma separated, supports * wildcards).',
  )
  .option('-l, --level <auditLevel>', 'The minimum audit level to validate.')
  .option(
    '-f, --filter-table [level]',
    'Filter table to show only vulnerabilities at or above specified level (defaults to audit level if no value provided).',
  )
  .option('-p, --production', 'Skip checking the devDependencies.')
  .option('--skip-optional', 'Skip checking the optionalDependencies.')
  .option('--json', 'Print the result as JSON on stdout (all other output goes to stderr).')
  .option('--package-manager <name>', 'Package manager to audit with: npm or pnpm (default: detected from the lockfile).')
  .option('-r, --registry <url>', 'The npm registry url to use.')
  .option('-i, --include-columns <columnName1>,<columnName2>,..,<columnNameN>', 'Columns to include in report.')
  .action((options: CommandOptions) => handleInput(options, callback));

program.parse(process.argv);
