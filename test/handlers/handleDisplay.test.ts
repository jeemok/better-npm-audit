import sinon from 'sinon';
import { expect } from 'chai';

import V6_SECURITY_REPORT_JSON from '../__mocks__/v6-security-report-table-data.json';
import V7_SCAN_REPORT_JSON from '../__mocks__/v7-scan-report-table-data.json';

import handleDisplay from '../../src/handlers/handleDisplay';

describe('Handle display report', () => {
  it('should be able to handle display properly', () => {
    const consoleStub = sinon.stub(console, 'info');
    const unhandledIds: number[] = [];
    const unusedExceptionIds: number[] = [];

    expect(consoleStub.called).to.equal(false);
    handleDisplay(V6_SECURITY_REPORT_JSON, V7_SCAN_REPORT_JSON, unhandledIds, unusedExceptionIds);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('🤝  All good!')).to.equal(true);

    consoleStub.restore();
  });

  it('should be able to handle found vulnerabilities properly', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleErrorStub = sinon.stub(console, 'error');
    const consoleInfoStub = sinon.stub(console, 'info');
    const unhandledIds = [1556, 1589];
    const unusedExceptionIds: number[] = [];

    expect(processStub.called).to.equal(false);
    expect(consoleErrorStub.called).to.equal(false);
    expect(consoleInfoStub.called).to.equal(false);

    handleDisplay(V6_SECURITY_REPORT_JSON, V7_SCAN_REPORT_JSON, unhandledIds, unusedExceptionIds);

    expect(processStub.called).to.equal(true);
    expect(consoleErrorStub.called).to.equal(true);
    expect(consoleInfoStub.called).to.equal(true); // Print security report

    expect(processStub.calledWith(1)).to.equal(true);
    expect(consoleErrorStub.calledWith('2 vulnerabilities found. Node security advisories: 1556, 1589')).to.equal(true);

    processStub.restore();
    consoleErrorStub.restore();
    consoleInfoStub.restore();
  });

  it('should inform the developer when exceptions IDs are unused', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleErrorStub = sinon.stub(console, 'error');
    const consoleWarnStub = sinon.stub(console, 'warn');
    const consoleInfoStub = sinon.stub(console, 'info');
    const unhandledIds: number[] = [];
    let unusedExceptionIds = [2001];

    expect(processStub.called).to.equal(false);
    expect(consoleErrorStub.called).to.equal(false);
    expect(consoleWarnStub.called).to.equal(false);
    expect(consoleInfoStub.called).to.equal(false);

    handleDisplay(V6_SECURITY_REPORT_JSON, V7_SCAN_REPORT_JSON, unhandledIds, unusedExceptionIds);

    expect(consoleInfoStub.called).to.equal(true); // Print security report
    expect(consoleWarnStub.called).to.equal(true);

    // Message for one unused exception
    // eslint-disable-next-line max-len
    let message = `1 of the excluded vulnerabilities did not match any of the found vulnerabilities: 2001. It can be removed from the .nsprc file or --exclude -x flags.`;
    expect(consoleWarnStub.calledWith(message)).to.equal(true);

    // Message for multiple unused exceptions
    unusedExceptionIds = [2001, 2002];
    handleDisplay(V6_SECURITY_REPORT_JSON, V7_SCAN_REPORT_JSON, unhandledIds, unusedExceptionIds);

    // eslint-disable-next-line max-len
    message = `2 of the excluded vulnerabilities did not match any of the found vulnerabilities: 2001, 2002. They can be removed from the .nsprc file or --exclude -x flags.`;
    expect(consoleWarnStub.calledWith(message)).to.equal(true);

    processStub.restore();
    consoleErrorStub.restore();
    consoleWarnStub.restore();
    consoleInfoStub.restore();
  });
});
