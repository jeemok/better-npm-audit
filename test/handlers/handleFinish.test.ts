import sinon from 'sinon';
import { expect } from 'chai';

import V6_JSON_BUFFER from '../__mocks__/v6-json-buffer.json';
import V6_JSON_BUFFER_EMPTY from '../__mocks__/v6-json-buffer-empty.json';

import handleFinish from '../../src/handlers/handleFinish';

describe('Events handling', () => {
  it('should exit if unable to process the JSON buffer', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleStub = sinon.stub(console, 'error');
    const jsonBuffer = '';
    const auditLevel = 'info';
    const exceptionIds: string[] = [];
    const exceptionModules: string[] = [];
    const columnsToInclude: string[] = [];

    expect(processStub.called).to.equal(false);
    expect(consoleStub.called).to.equal(false);

    handleFinish(jsonBuffer, auditLevel, exceptionIds, exceptionModules, columnsToInclude);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(1)).to.equal(true);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('Unable to process the JSON buffer string.')).to.equal(true);
    expect(consoleStub.args.some(([message]) => /returned/.test(message))).to.equal(true);

    processStub.restore();
    consoleStub.restore();
  });

  it('should be able to handle success case properly', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER_EMPTY);
    const auditLevel = 'info';
    const exceptionIds: string[] = [];
    const exceptionModules: string[] = [];
    const columnsToInclude: string[] = [];

    expect(consoleStub.called).to.equal(false);
    handleFinish(jsonBuffer, auditLevel, exceptionIds, exceptionModules, columnsToInclude);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(0)).to.equal(true);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('🤝  All good!')).to.equal(true);

    processStub.restore();
    consoleStub.restore();
  });

  it('should be able to except vulnerabilities by id properly', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER);
    const auditLevel = 'info';
    const exceptionIds = ['975', '985', '1179', '1213', '1500', '1523', '1555', '1556', '1589'];
    const exceptionModules = ['swagger-ui', 'mem'];
    const columnsToInclude: string[] = [];

    expect(consoleStub.called).to.equal(false);
    handleFinish(jsonBuffer, auditLevel, exceptionIds, exceptionModules, columnsToInclude);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(0)).to.equal(true);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('🤝  All good!')).to.equal(true);

    processStub.restore();
    consoleStub.restore();
  });

  it('should be able to handle found vulnerabilities properly', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleErrorStub = sinon.stub(console, 'error');
    const consoleInfoStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER);
    const auditLevel = 'info';
    const exceptionIds = ['975', '976', '985', '1084', '1179', '1213', '1500', '1523', '1555'];
    const exceptionModules: string[] = [];
    const columnsToInclude: string[] = [];

    expect(processStub.called).to.equal(false);
    expect(consoleErrorStub.called).to.equal(false);
    expect(consoleInfoStub.called).to.equal(false);

    handleFinish(jsonBuffer, auditLevel, exceptionIds, exceptionModules, columnsToInclude);

    expect(processStub.called).to.equal(true);
    expect(consoleErrorStub.called).to.equal(true);
    expect(consoleInfoStub.called).to.equal(true); // Print security report

    expect(processStub.calledWith(1)).to.equal(true);
    expect(consoleErrorStub.calledWith('2 vulnerabilities found. Node security advisories: 1556, 1589')).to.equal(true);

    processStub.restore();
    consoleErrorStub.restore();
    consoleInfoStub.restore();
  });

  it('should inform the developer when exceptionsIds and ignoredModules are unused', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleErrorStub = sinon.stub(console, 'error');
    const consoleWarnStub = sinon.stub(console, 'warn');
    const consoleInfoStub = sinon.stub(console, 'info');
    const jsonBuffer = JSON.stringify(V6_JSON_BUFFER);
    const auditLevel = 'info';
    let exceptionModules = ['fakeModule1', 'fakeModule2'];
    let exceptionIds = ['975', '976', '985', '1084', '1179', '1213', '1500', '1523', '1555', '2001'];
    const columnsToInclude: string[] = [];

    expect(processStub.called).to.equal(false);
    expect(consoleErrorStub.called).to.equal(false);
    expect(consoleWarnStub.called).to.equal(false);
    expect(consoleInfoStub.called).to.equal(false);

    handleFinish(jsonBuffer, auditLevel, exceptionIds, exceptionModules, columnsToInclude);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(1)).to.equal(true);
    expect(consoleErrorStub.called).to.equal(true);
    expect(consoleErrorStub.calledWith('2 vulnerabilities found. Node security advisories: 1556, 1589')).to.equal(true);

    expect(consoleInfoStub.called).to.equal(true); // Print security report
    expect(consoleWarnStub.called).to.equal(true);

    // Message for one unused exception
    let message = [
      '1 of the excluded vulnerabilities did not match any of the found vulnerabilities: 2001.',
      'It can be removed from the .nsprc file or --exclude -x flags.',
      '2 of the ignored modules did not match any of the found vulnerabilities: fakeModule1, fakeModule2.',
      'They can be removed from the --module-ignore -m flags.',
    ].join(' ');
    expect(consoleWarnStub.calledWith(message)).to.equal(true);

    // Message for multiple unused exceptions
    exceptionIds = ['975', '976', '985', '1084', '1179', '1213', '1500', '1523', '1555', '2001', '2002'];
    exceptionModules = ['fakeModule1'];
    handleFinish(jsonBuffer, auditLevel, exceptionIds, exceptionModules, columnsToInclude);
    message = [
      '2 of the excluded vulnerabilities did not match any of the found vulnerabilities: 2001, 2002.',
      'They can be removed from the .nsprc file or --exclude -x flags.',
      '1 of the ignored modules did not match any of the found vulnerabilities: fakeModule1.',
      'It can be removed from the --module-ignore -m flags.',
    ].join(' ');
    expect(consoleWarnStub.calledWith(message)).to.equal(true);

    processStub.restore();
    consoleErrorStub.restore();
    consoleWarnStub.restore();
    consoleInfoStub.restore();
  });

  describe('JSON output', () => {
    // Capture the JSON document written to stdout and run the exit callback immediately
    const run = (jsonBuffer: string, exceptionIds: string[] = []) => {
      const written: string[] = [];
      const exitStub = sinon.stub(process, 'exit');
      const writeStub = sinon.stub(process.stdout, 'write').callsFake(((chunk: string, cb?: () => void) => {
        if (chunk.startsWith('{')) written.push(chunk);
        if (cb) cb();
        return true;
      }) as never);
      const infoStub = sinon.stub(console, 'info');
      const errorStub = sinon.stub(console, 'error');
      handleFinish(jsonBuffer, 'info', exceptionIds, [], [], undefined, true);
      const exitCode = exitStub.lastCall?.args[0];
      const infoCalls = infoStub.callCount;
      [exitStub, writeStub, infoStub, errorStub].forEach((stub) => stub.restore());
      return { doc: JSON.parse(written.join('')), exitCode, infoCalls };
    };

    it('should print a passing document and exit 0 when nothing is vulnerable', () => {
      const { doc, exitCode, infoCalls } = run(JSON.stringify(V6_JSON_BUFFER_EMPTY));
      expect(doc.passed).to.equal(true);
      expect(doc.vulnerabilities).to.eql([]);
      expect(doc.summary.total).to.equal(0);
      expect(exitCode).to.equal(0);
      expect(infoCalls).to.equal(0);
    });

    it('should list every vulnerability and exit 1 when unhandled ones exist', () => {
      const { doc, exitCode } = run(JSON.stringify(V6_JSON_BUFFER));
      expect(doc.passed).to.equal(false);
      expect(doc.unhandledIds.length).to.be.greaterThan(0);
      expect(doc.summary.total).to.equal(doc.vulnerabilities.length);
      expect(doc.vulnerabilities[0]).to.have.all.keys('id', 'module', 'title', 'paths', 'severity', 'url', 'fix', 'excepted');
      expect(doc.vulnerabilities[0].paths).to.be.an('array');
      expect(exitCode).to.equal(1);
    });

    it('should mark excepted vulnerabilities and pass when all are excepted', () => {
      const ids = (run(JSON.stringify(V6_JSON_BUFFER)).doc.vulnerabilities as { id: string }[]).map(({ id }) => id);
      const { doc, exitCode } = run(JSON.stringify(V6_JSON_BUFFER), ids);
      expect(doc.passed).to.equal(true);
      expect(doc.vulnerabilities.every((v: { excepted: boolean }) => v.excepted)).to.equal(true);
      expect(exitCode).to.equal(0);
    });

    it('should print an error document and exit 1 when the audit output is invalid', () => {
      const { doc, exitCode } = run('not json');
      expect(doc.passed).to.equal(false);
      expect(doc.error).to.be.a('string');
      expect(exitCode).to.equal(1);
    });
  });
});
