import { ExecException } from "child_process";

const { load } = require("js-yaml");

// TODO: This might be unused
/**
 * @param  {String | Number | Null | Boolean} value     The input number
 * @return {Boolean}                                    Returns true if the input is a whole number
 */
export function isWholeNumber(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (!Number(value)) {
    return false;
  }
  return Number(value) % 1 === 0;
}

/**
 * @param {string} string     The YAML stringified object
 * @returns {Boolean}         Returns true if the input string is parse-able
 */
export function isYamlString(string: string, logError: boolean = true): boolean {
  try {
    load(string);
  } catch(e){
    if (logError){      
      console.log('Failed parsing .nsprc file: ' + e);
      throw e;
    }
  }
  return true;
}

/**
 * @param {String} string     The YAML/JSON stringified object
 * @returns {Array<Boolean>}  An array with two booleans where the first determines if the input string was valid and the second if the contents are yaml or not.
 */
export function getValidStatusAndType(string: string): Array<Boolean> {
  let isYaml = false;  
  try{
    if (isYaml = isYamlString(string, false) || isJsonString(string, false)){
      return [true, isYaml];
    }      
  } catch (e) {
    console.log('Failed parsing .nsprc file: ' + e);     
  }  
  return [false,false];
}

/**
 * @param  {String} string      The JSON stringified object
 * @param  {Boolean} logError  A boolean that determines if an error should be logged to console
 * @return {Boolean}            Returns true if the input string is parse-able
 */
export function isJsonString(string: string, logError: boolean = true): boolean {
  try {
    JSON.parse(string);
  } catch (e) {
    if (logError){
      console.log('Failed parsing .nsprc file: ' + e);
    }
    return false;
  }
  return true;
}

// TODO: Add unit tests
/**
 * Trim array size to a maximum number
 * @param {Array} array       Array to trim
 * @param {Number} maxLength  Desired length
 * @return {Array}            Trimmed array with additional message
 */
export function trimArray(array: string[], maxLength: number): string[] {
  const originalLength = array.length;
  const removedLength = Math.max(0, originalLength - maxLength);
  if (removedLength === 0) {
    return array;
  }
  array.length = maxLength;
  return array.concat(`...and ${removedLength} more`);
}

/**
 * Shorten node path (node_modules/nodemon/node_modules/chokidar/node_modules/fsevents) to (nodemon>chokidar>fsevents)
 * @param {String} path Full node path
 * @return {String}     Shorten Path
 */
export function shortenNodePath(path: string): string {
  return path.replace('node_modules/', '').replace(/\/node_modules\//g, '>');
}
