import { ParsedCommandOptions, ProcessedResult } from 'src/types';
import { processAuditJson } from '../utils/vulnerability';

/**
 * Analyze audit response
 * @param {String} jsonBuffer   Audit JSON string
 * @param {Array} exceptionIds  User's exception IDs
 * @param {Object} options      Command options
 * @return {Object}             Result
 */
export default function handleAudit(jsonBuffer: string, exceptionIds: number[], options: ParsedCommandOptions): ProcessedResult {
  const result = processAuditJson(jsonBuffer, exceptionIds, options);

  // If unable to process the audit JSON
  if (result.failed) {
    console.error('Unable to process the JSON buffer string.');
    // Exit failed
    process.exit(1);
  }

  return result;
}
