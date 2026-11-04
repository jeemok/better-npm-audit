import fs from 'fs';
import YAML from 'yaml';
import { NsprcFile } from 'src/types';

/**
 * Read file from path. Supports both JSON and YAML (JSON is a subset of YAML).
 * @param  {String} path          File path
 * @return {(Object | Boolean)}   Returns the parsed data if found, or else returns `false`
 */
export function readFile(path: string): NsprcFile | boolean {
  try {
    const data = fs.readFileSync(path, 'utf8');
    const parsed = YAML.parse(data);
    if (parsed === null || typeof parsed !== 'object') {
      return false;
    }
    return parsed;
  } catch (err) {
    console.log('Failed parsing .nsprc file: ' + err);
    return false;
  }
}
