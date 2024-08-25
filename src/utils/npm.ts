import { execSync } from 'child_process';

/**
 * Get the current npm version
 * @return {String} The npm version
 */
export function getNpmVersion(): string {
  const version = execSync('npm --version');
  return version.toString();
}
