import { exec } from 'child_process';
import { Readable } from 'stream';

/**
 * Get the current npm version
 * @return {String} The npm version
 */
export function getNpmVersion(): string {
  const version = exec('npm --version');
  return (version.stdout as Readable).toString();
}
