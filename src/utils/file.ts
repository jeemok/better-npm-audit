import fs from 'fs';
import { NsprcFile } from 'src/types';
import { getValidStatusAndType } from './common';
import YAML from 'yaml';

/**
 * Read file from path
 * @param  {String} path          File path
 * @return {(Object | Boolean)}   Returns the parsed data if found, or else returns `false`
 */
export function readFile(path: string): NsprcFile | boolean {
  try {
    const data = fs.readFileSync(path, 'utf8');
    const validAndType = getValidStatusAndType(data);

    if (validAndType[0]) {
      if (validAndType[1]) {
        return YAML.parse(data);
      } else {
        return JSON.parse(data);
      }
    }

    return false;
  } catch (err) {
    return false;
  }
}
