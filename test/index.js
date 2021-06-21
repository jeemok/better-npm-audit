const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;

const V6_JSON_BUFFER = require('./__mocks__/v6-json-buffer.json');
const V6_JSON_BUFFER_EMPTY = require('./__mocks__/v6-json-buffer-empty.json');

const { handleFinish } = require('../index');

describe('Events handling', () => {
  it('should exit if unable to process the JSON buffer', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleStub = sinon.stub(console, 'error');
    const jsonBuffer = '';
    const auditLevel = 'info';
    const exceptionIds = [];

    expect(processStub.called).to.equal(false);
    expect(consoleStub.called).to.equal(false);

    handleFinish(jsonBuffer, auditLevel, exceptionIds);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(1)).to.equal(true);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('Unable to process the JSON buffer string.')).to.equal(true);

    processStub.restore();
    consoleStub.restore();
  });

  it('should be able to handle success case properly', () => {
    const consoleStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER_EMPTY);
    const auditLevel = 'info';
    const exceptionIds = [];

    expect(consoleStub.called).to.equal(false);
    handleFinish(jsonBuffer, auditLevel, exceptionIds);
    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('🤝  All good!')).to.equal(true);

    consoleStub.restore();
  });

  it('should be able to except vulnerabilities properly', () => {
    const consoleStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER);
    const auditLevel = 'info';
    const exceptionIds = [975, 976, 985, 1084, 1179, 1213, 1500, 1523, 1555, 1556, 1589];

    expect(consoleStub.called).to.equal(false);
    handleFinish(jsonBuffer, auditLevel, exceptionIds);
    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('🤝  All good!')).to.equal(true);

    consoleStub.restore();
  });

  it('should be able to handle found vulnerabilities properly', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleErrorStub = sinon.stub(console, 'error');
    const consoleInfoStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER);
    const auditLevel = 'info';
    const exceptionIds = [975, 976, 985, 1084, 1179, 1213, 1500, 1523, 1555];

    expect(processStub.called).to.equal(false);
    expect(consoleErrorStub.called).to.equal(false);
    expect(consoleInfoStub.called).to.equal(false);

    handleFinish(jsonBuffer, auditLevel, exceptionIds);

    expect(processStub.called).to.equal(true);
    expect(consoleErrorStub.called).to.equal(true);
    expect(consoleInfoStub.called).to.equal(true); // Print security report

    expect(processStub.calledWith(1)).to.equal(true);
    expect(consoleErrorStub.calledWith('2 vulnerabilities found. Node security advisories: 1556, 1589')).to.equal(true);

    processStub.restore();
    consoleErrorStub.restore();
    consoleInfoStub.restore();
  });

  it('should inform the developer when exceptionsIds are unused', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleErrorStub = sinon.stub(console, 'error');
    const consoleWarnStub = sinon.stub(console, 'warn');
    const consoleInfoStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER);
    const auditLevel = 'info';
    const exceptionIds = [975, 976, 985, 1084, 1179, 1213, 1500, 1523, 1555, 2001, 2002];

    expect(processStub.called).to.equal(false);
    expect(consoleErrorStub.called).to.equal(false);
    expect(consoleWarnStub.called).to.equal(false);
    expect(consoleInfoStub.called).to.equal(false);

    handleFinish(jsonBuffer, auditLevel, exceptionIds);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(1)).to.equal(true);
    expect(consoleErrorStub.called).to.equal(true);
    expect(consoleErrorStub.calledWith('2 vulnerabilities found. Node security advisories: 1556, 1589')).to.equal(true);

    expect(consoleInfoStub.called).to.equal(true); // Print security report
    expect(consoleWarnStub.called).to.equal(true);
    // eslint-disable-next-line max-len
    const message = `2 vulnerabilities where excluded but did not result in a vulnerabilities: 2001, 2002. They can be removed from the .nsprc file or --exclude -x flags.`;
    expect(consoleWarnStub.calledWith(message)).to.equal(true);

    processStub.restore();
    consoleErrorStub.restore();
    consoleWarnStub.restore();
    consoleInfoStub.restore();
  });
});
