const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;

const { handleAction } = require('../index.ts');

describe('Flags', () => {
  describe('default', () => {
    it('should be able to handle default correctly', () => {
      const callbackStub = sinon.stub();
      const options = {};

      expect(callbackStub.called).to.equal(false);
      handleAction(options, callbackStub);
      expect(callbackStub.called).to.equal(true);

      const auditCommand = 'npm audit ';
      const auditLevel = 'info';
      const exceptionIds = [];
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--exclude', () => {
    it('should be able to pass exception IDs using the command flag smoothly', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { exclude: '1567,919' };
      const auditCommand = 'npm audit ';
      const auditLevel = 'info';
      const exceptionIds = [1567, 919];

      expect(callbackStub.called).to.equal(false);
      handleAction(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      // with space
      options.exclude = '1567, 1902';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, [1567, 1902])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 1902')).to.equal(true);

      // invalid exceptions
      options.exclude = '1134,undefined,888';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, [1134, 888])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1134, 888')).to.equal(true);

      // invalid NaN
      options.exclude = '1134,NaN,3e,828';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, [1134, 828])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1134, 828')).to.equal(true);

      // invalid decimals
      options.exclude = '1199,29.41,628';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, [1199, 628])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1199, 628')).to.equal(true);

      consoleStub.restore();
    });

    it('should info log the vulnerabilities if it is only passed in command line', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { exclude: '1567,919' };
      const auditCommand = 'npm audit ';
      const auditLevel = 'info';
      const exceptionIds = [1567, 919];

      expect(callbackStub.called).to.equal(false);
      handleAction(options, callbackStub);

      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.called).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      consoleStub.restore();
    });

    it('should not info log the vulnerabilities if there are no exceptions given', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = {};
      const auditCommand = 'npm audit ';
      const auditLevel = 'info';
      const exceptionIds = [];

      expect(callbackStub.called).to.equal(false);
      handleAction(options, callbackStub);

      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.called).to.equal(false);

      consoleStub.restore();
    });
  });

  describe('--production', () => {
    it('should be able to set production mode from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      const options = { production: true };
      const auditCommand = 'npm audit --production';
      const auditLevel = 'info';
      const exceptionIds = [];

      expect(callbackStub.called).to.equal(false);
      handleAction(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });

    // TODO check this, or maybe not? use picha eat to check json output
    it('should not exit on dev dependencies vulnerabilites when using production flag', () => {});
  });

  describe('--level', () => {
    it('should be able to pass audit level from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      const options = { level: 'info' };

      const auditCommand = 'npm audit ';
      const exceptionIds = [];

      expect(callbackStub.called).to.equal(false);
      handleAction(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, 'info', exceptionIds)).to.equal(true);

      options.level = 'low';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'low', exceptionIds)).to.equal(true);

      options.level = 'moderate';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'moderate', exceptionIds)).to.equal(true);

      options.level = 'high';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'high', exceptionIds)).to.equal(true);

      options.level = 'critical';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'critical', exceptionIds)).to.equal(true);
    });

    it('should be able to pass audit level from the environment variables correctly', () => {
      const callbackStub = sinon.stub();
      const options = {};
      const auditCommand = 'npm audit ';

      // info
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'info';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'info')).to.equal(true);

      // low
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'low';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'low')).to.equal(true);

      // moderate
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'moderate';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'moderate')).to.equal(true);

      // high
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'high';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'high')).to.equal(true);

      // critical
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'critical';
      handleAction(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'critical')).to.equal(true);

      // Clean up
      process.env.NPM_CONFIG_AUDIT_LEVEL = undefined;
    });
  });
});
