import { exec } from 'child_process';
import {
  FinalReport,
  FinalReportProcessed,
  FinalReportResult,
  ParsedCommandOptions,
  ScanCallbackPayload,
  ScanModulePayload,
} from 'src/types';
import { readFile } from '../utils/file';
import { cleanContent } from '../utils/common';
import { mapModuleDependencies, processExceptions } from '../utils/vulnerability';
import { color } from '../utils/color';

/**
 * Scanning dependent modules for unhandled vulnerabilities for v7 NPM audit
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
      vul.nodes.map(
        (nodePath: string): Promise<FinalReport> =>
          new Promise((resolve) => {
            // Get the installed version so we can check its dependencies
            // Damn v7 npm audit doesn't provide such important information!
            const packageFile = readFile(`${nodePath}/package.json`);

            // If we couldn't find the package.json, then we would not be able to proceed checking further
            if (typeof packageFile === 'boolean') {
              console.warn(`${nodePath}/package.json not found.`);
              return resolve({
                ...vul,
                nodePath,
                foundPackage: false,
                scanReport: [[String(vul.id), '', nodePath, color('error', 'red'), '', '', '']],
              });
            }

            // Get all the dependent modules path to the reported vulnerable module
            const command = `npm ls ${vul.name}@${packageFile.version} --json --long`;

            exec(command, (error, dependenciesDetails) => {
              if (error) {
                console.error(error);
                // Exit failed
                process.exit(1);
              }

              // Find all the dependent modules' path
              const dependencyPaths = mapModuleDependencies(JSON.parse(dependenciesDetails));

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
                  scanReport.push([
                    reportRow[0],
                    <string>packageFile.version,
                    nodePath,
                    reportRow[1],
                    reportRow[2],
                    reportRow[3],
                    nsprcPath,
                  ]);
                }

                // Check if the maintainer have explicitly exclude this vulnerability
                const shouldExcept = exceptionIds.includes(vul.id);
                if (shouldExcept) {
                  usedFilePath = nsprcPath;
                }

                return shouldExcept;
              });

              return resolve({
                ...vul,
                nodePath,
                foundPackage: true,
                shouldAutoExcept,
                usedFilePath,
                dependencyPaths,
                scanReport,
              });
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
