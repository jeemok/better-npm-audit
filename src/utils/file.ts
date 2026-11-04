import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { NsprcFile } from 'src/types';

/**
 * Read file from path. Supports both JSON and YAML (JSON is a subset of YAML).
 * @param  {String} filePath      File path
 * @return {(Object | Boolean)}   Returns the parsed data if found, or else returns `false`
 */
export function readFile(filePath: string): NsprcFile | boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const data = fs.readFileSync(filePath, 'utf8');
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

const JS_CONFIG_FILES = ['.nsprc.cjs', '.nsprc.js'];

const isObject = (value: unknown): value is NsprcFile => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Find a JavaScript exceptions config (`.nsprc.cjs` or `.nsprc.js`), which takes precedence over the static `.nsprc`
 * @param  {String} dir   Directory to look in
 * @return {String}       The file name, or `undefined` if there is none
 */
export function findNsprcModule(dir = '.'): string | undefined {
  return JS_CONFIG_FILES.find((name) => fs.existsSync(path.join(dir, name)));
}

/**
 * Load a JavaScript exceptions config. It may export an object, or a (sync or async) function that returns one,
 * via `module.exports` or a default export. Note that this executes the code in the module.
 * Exits the process with an error message if the module cannot be loaded or has the wrong shape.
 * @param  {String} fileName  Name of the module, see `findNsprcModule`
 * @param  {String} dir       Directory of the module
 * @return {Promise}          Resolves to the exceptions
 */
export async function loadNsprcModule(fileName: string, dir = '.'): Promise<NsprcFile> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loaded = require(path.resolve(dir, fileName));
    const exported = loaded && loaded.default !== undefined ? loaded.default : loaded;
    const value = typeof exported === 'function' ? await exported() : exported;
    if (isObject(value)) {
      return value;
    }
    console.error(`${fileName} must export an object (or a function returning one) with the same structure as .nsprc.`);
  } catch (err) {
    console.error(`Failed loading ${fileName}: ${err}`);
  }
  return process.exit(1);
}
