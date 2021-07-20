import { ParsedCommandOptions } from '../../src/types';
import { printSecurityReport, printExceptionReport } from '../../src/utils/print';

import EXCEPTION_TABLE_DATA from '../__mocks__/exception-table-data.json';
import V7_SECURITY_REPORT_TABLE_DATA from '../__mocks__/v7-security-report-table-data.json';

describe('Print utils', () => {
  it('exception table visual', () => {
    printExceptionReport(EXCEPTION_TABLE_DATA);
  });

  it('security report table visual', () => {
    printSecurityReport(V7_SECURITY_REPORT_TABLE_DATA, {} as ParsedCommandOptions);
  });
});

export {};
