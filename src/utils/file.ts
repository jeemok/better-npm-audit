import fs from 'fs';
import { NsprcFile } from 'src/types';
import { isJsonString } from './common';

/**
 * Read file from path
 * @param  {String} path          File path
 * @return {(Object | Boolean)}   Returns the parsed data if found, or else returns `false`
 */
export function readFile(path: string): NsprcFile | boolean {
  try {
    const data = fs.readFileSync(path, 'utf8');
    if (!isJsonString(data)) {
      return false;
    }
    return JSON.parse(data);
  } catch (err) {
    return false;
  }
}
