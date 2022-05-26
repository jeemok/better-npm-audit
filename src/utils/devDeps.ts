import fs from 'fs';
/**
 * Searches for the name of devDependencies on package.json
 * @param { string } route Route to package.json
 * @return {[string, string][]}             List: with the name and version of dev packages
 */
export function devDependenciesGetter(route: string): [string, unknown][] {
  const devDependencies = JSON.parse(fs.readFileSync(route, 'utf-8'));
  const arr = Object.entries(devDependencies.devDependencies);
  return arr;
}
