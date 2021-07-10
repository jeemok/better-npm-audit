import sinon from 'sinon';
import { expect } from 'chai';
import { printSecurityReport, printExceptionReport } from '../../src/utils/print';

import EXCEPTION_TABLE_DATA from '../__mocks__/exception-table-data.json';
import EXCEPTION_TABLE from '../__mocks__/exception-table';
import V7_SECURITY_REPORT_TABLE_DATA from '../__mocks__/v7-security-report-table-data.json';
import V7_SECURITY_REPORT_TABLE from '../__mocks__/v7-security-report-table';

describe('Print utils', () => {
  it('should display the exception table correctly', () => {
    const consoleStub = sinon.stub(console, 'info');

    expect(consoleStub.called).to.equal(false);

    printExceptionReport(EXCEPTION_TABLE_DATA);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.firstCall.args[0]).to.equal(EXCEPTION_TABLE);

    consoleStub.restore();
  });

  it('exception table visual', () => {
    printExceptionReport(EXCEPTION_TABLE_DATA);
  });

  it('should display the security report table correctly', () => {
    const consoleStub = sinon.stub(console, 'info');

    expect(consoleStub.called).to.equal(false);

    printSecurityReport(V7_SECURITY_REPORT_TABLE_DATA);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.firstCall.args[0]).to.equal(V7_SECURITY_REPORT_TABLE);

    consoleStub.restore();
  });

  it('security report table visual', () => {
    printSecurityReport(V7_SECURITY_REPORT_TABLE_DATA);
  });
});

export {};
