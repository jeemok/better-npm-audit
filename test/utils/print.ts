const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
const { printSecurityReport, printExceptionReport } = require('../../utils/print');
const EXCEPTION_TABLE_DATA = require('../__mocks__/exception-table-data.json');
const EXCEPTION_TABLE = require('../__mocks__/exception-table');
const V7_SECURITY_REPORT_TABLE_DATA = require('../__mocks__/v7-security-report-table-data.json');
const V7_SECURITY_REPORT_TABLE = require('../__mocks__/v7-security-report-table');

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
