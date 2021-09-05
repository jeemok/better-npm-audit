import {
  FinalReport,
  FinalReportProcessed,
  FinalReportResult,
  ParsedCommandOptions,
  ScanCallbackPayload,
  ScanModulePayload,
  v6Finding,
} from 'src/types';
import { readFile } from '../utils/file';
import { cleanContent } from '../utils/common';
import { processExceptions, breakDependencyPath } from '../utils/vulnerability';

/**
 * Scanning dependent modules for unhandled vulnerabilities for v6 NPM audit
 * @param {Array} scanModules     Unhandled vulnerability details to be scanned
 * @param {Array} securityReport  Security report table data
 * @param {Array} unhandledIds    Unhandled reported vulnerability IDs
 * @param {Object} options        Command options
 * @param {Function} callback     Callback
 */
export default function handleScan(
  scanModules: ScanModulePayload[],
  securityReport: string[][],
  unhandledIds: number[],
  options: ParsedCommandOptions,
  callback: (T1: unknown, T2: ScanCallbackPayload) => void,
): void {
  // Promises of each unhandled vulnerability
  const vulnerabilityPromises = scanModules.map((vul: ScanModulePayload): Promise<FinalReport[]> => {
    // One reported vulnerability might have multiple affected modules or same module with different version installed
    // So we would need to make sure all the affected modules agreed to except this, before we automatically ignore it.
    // Promises of each affected module
    return Promise.all(
      vul.findings.map(
        (finding: v6Finding): Promise<FinalReport> =>
          new Promise((resolve) => {
            const paths = finding.paths.map((each) => each.split('>').join('/node_modules/'));
            const dependencyPaths = paths.reduce((acc: string[], cur) => acc.concat(breakDependencyPath(`node_modules/${cur}`)), []);

            if (options.debug) {
              console.log(
                `Dependent modules's path for package ${vul.name} (vulnerability ID: ${vul.id}): ${JSON.stringify(
                  dependencyPaths,
                  null,
                  2,
                )}`,
              );
            }

            let usedFilePath;
            const scanReport: string[][] = [];

            // Check if any of them has `.nsprc` file and wants to ignore/except this vulnerability
            const shouldAutoExcept = dependencyPaths.some((path: string) => {
              const nsprcPath = `${path}/.nsprc`;

              // Try retrieving the `.nsprc` file
              if (options.debug) {
                console.log(`Reading file ${nsprcPath}...`);
              }
              const nsprcFile = readFile(nsprcPath);

              // File not found
              if (typeof nsprcFile === 'boolean') {
                if (options.debug) {
                  console.log(`${nsprcPath} not found.`);
                }
                return false;
              }

              // Process the file to get its exceptions
              const { report, exceptionIds } = processExceptions(nsprcFile, []);

              // Find the row
              const reportRow = report.find((row: string[]) => String(row[0]) === String(vul.id));
              if (reportRow) {
                scanReport.push([reportRow[0], vul.name, finding.version, reportRow[1], reportRow[2], reportRow[3], nsprcPath]);
              }

              // Check if the maintainer have explicitly exclude this vulnerability
              const shouldExcept = exceptionIds.includes(vul.id);
              if (shouldExcept) {
                if (options.debug) {
                  console.log(`Found and accepted exception from the maintainer for vulnerability ${vul.id}.`);
                }
                usedFilePath = nsprcPath;
              } else {
                console.log(`No exception found from the maintainer for vulnerability ${vul.id}.`);
              }

              return shouldExcept;
            });

            return resolve({
              ...vul,
              foundPackage: true,
              shouldAutoExcept,
              usedFilePath,
              dependencyPaths,
              scanReport,
            });
          }),
      ),
    );
  });

  // After all has resolved
  Promise.all(vulnerabilityPromises).then((finalReport: FinalReport[][]) => {
    // Map out the result
    const { scanReport, result } = finalReport.reduce(
      (acc: FinalReportProcessed, cur: FinalReport[]) => {
        const reports = cur.reduce((final: string[][], each: FinalReport) => final.concat(each.scanReport), []);
        acc.scanReport = [...acc.scanReport, ...reports];

        acc.result.push({
          id: cur[0].id,
          shouldExcept: cur.every((report: FinalReport) => report.shouldAutoExcept),
        });

        return acc;
      },
      {
        scanReport: [],
        result: [],
      },
    );

    // Get the ones that can be auto excluded
    const autoExceptionIds = result.reduce((a: number[], c: FinalReportResult) => {
      if (c.shouldExcept) {
        return a.concat(c.id);
      }
      return a;
    }, []);

    // If no new vulnerability to be excepted, return the original result with the scan report
    if (!autoExceptionIds.length) {
      return callback(null, { scanReport, securityReport, unhandledIds });
    }

    // Update the security report
    const newSecurityReport = securityReport.map((row: string[]) => {
      // "ID" column
      if (!autoExceptionIds.includes(Number(cleanContent(row[0])))) {
        return row;
      }
      // Remove all the coloring code
      return row.map((column, index) => {
        // "Ex."" column
        if (index === 6) {
          return 'auto';
        }
        // TODO: recolor the severity background: getSeverityBgColor
        return cleanContent(column);
      });
    });

    // Update the unhandled vulnerabilities
    const newUnhandled = unhandledIds.filter((each) => !autoExceptionIds.includes(each));

    return callback(null, {
      scanReport,
      securityReport: newSecurityReport,
      unhandledIds: newUnhandled,
    });
  });
}
