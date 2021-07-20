import sinon from 'sinon';
import { expect } from 'chai';
import { CommandOptions, ParsedCommandOptions } from '../../src/types';
import handleInput from '../../src/handlers/handleInput';

describe('Handle user input', () => {
  describe('default', () => {
    it('should be able to handle default correctly', () => {
      const callbackStub = sinon.stub();
      const options = { scanModules: false };

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);

      const auditCommand = 'npm audit';
      const exceptionIds: number[] = [];
      const parsedOptions: ParsedCommandOptions = {
        level: 'info',
        scanModules: true,
      };
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
    });
  });

  describe('--exclude', () => {
    it('should be able to pass exception IDs using the command flag smoothly', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const auditCommand = 'npm audit';
      const exceptionIds = [1567, 919];
      let options: CommandOptions = { scanModules: 'false', exclude: '1567,919' };
      let parsedOptions: ParsedCommandOptions = { level: 'info', scanModules: false, exclude: '1567,919' };

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      // with space
      options = { scanModules: 'false', exclude: '1567, 1902' };
      parsedOptions = { level: 'info', scanModules: false, exclude: '1567, 1902' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, [1567, 1902], parsedOptions)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 1902')).to.equal(true);

      // invalid exceptions
      options = { scanModules: 'false', exclude: '1134,undefined,888' };
      parsedOptions = { level: 'info', scanModules: false, exclude: '1134,undefined,888' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, [1134, 888], parsedOptions)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1134, 888')).to.equal(true);

      // invalid NaN
      options = { scanModules: 'false', exclude: '1134,NaN,3e,828' };
      parsedOptions = { level: 'info', scanModules: false, exclude: '1134,NaN,3e,828' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, [1134, 828], parsedOptions)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1134, 828')).to.equal(true);

      // invalid decimals
      options = { scanModules: 'false', exclude: '1199,29.41,628' };
      parsedOptions = { level: 'info', scanModules: false, exclude: '1199,29.41,628' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, [1199, 628], parsedOptions)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1199, 628')).to.equal(true);

      consoleStub.restore();
    });

    it('should info log the vulnerabilities if it is only passed in command line', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options: CommandOptions = { scanModules: false, exclude: '1567,919' };
      const auditCommand = 'npm audit';
      const exceptionIds = [1567, 919];
      const parsedOptions: ParsedCommandOptions = {
        level: 'info',
        scanModules: true,
        exclude: '1567,919',
      };

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);

      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
      expect(consoleStub.called).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      consoleStub.restore();
    });

    it('should not info log the vulnerabilities if there are no exceptions given', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { scanModules: false };
      const auditCommand = 'npm audit';
      const exceptionIds: number[] = [];
      const parsedOptions: ParsedCommandOptions = {
        level: 'info',
        scanModules: true,
      };

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);

      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
      expect(consoleStub.called).to.equal(false);

      consoleStub.restore();
    });
  });

  describe('--production', () => {
    it('should be able to set production mode from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      const options = { scanModules: false, production: true };
      const auditCommand = 'npm audit --production';
      const exceptionIds: number[] = [];
      const parsedOptions: ParsedCommandOptions = { level: 'info', scanModules: true, production: true };

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
    });
  });

  describe('--registry', () => {
    it('should be able to set registry from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      const options: CommandOptions = { scanModules: false, registry: 'https://registry.npmjs.org/' };
      const auditCommand = 'npm audit --registry=https://registry.npmjs.org/';
      const exceptionIds: number[] = [];
      const parsedOptions: ParsedCommandOptions = { level: 'info', scanModules: true, registry: 'https://registry.npmjs.org/' };

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
    });
  });

  describe('--level', () => {
    it('should be able to pass audit level from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      let options: CommandOptions = { level: 'info', scanModules: 'false' };
      let parsedOptions: ParsedCommandOptions = { level: 'info', scanModules: false };

      const auditCommand = 'npm audit';
      const exceptionIds: number[] = [];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      options = { level: 'low', scanModules: 'false' };
      parsedOptions = { level: 'low', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      options = { level: 'moderate', scanModules: 'false' };
      parsedOptions = { level: 'low', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      options = { level: 'high', scanModules: 'false' };
      parsedOptions = { level: 'high', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      options = { level: 'critical', scanModules: 'false' };
      parsedOptions = { level: 'critical', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);
    });

    it('should be able to pass audit level from the environment variables correctly', () => {
      const callbackStub = sinon.stub();
      const options: CommandOptions = { scanModules: 'false' };
      const exceptionIds: number[] = [];
      const auditCommand = 'npm audit';
      let parsedOptions: ParsedCommandOptions;

      // info
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'info';
      parsedOptions = { level: 'info', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      // low
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'low';
      parsedOptions = { level: 'low', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      // moderate
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'moderate';
      parsedOptions = { level: 'moderate', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      // high
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'high';
      parsedOptions = { level: 'high', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      // critical
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'critical';
      parsedOptions = { level: 'critical', scanModules: false };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, exceptionIds, parsedOptions)).to.equal(true);

      // Clean up
      process.env.NPM_CONFIG_AUDIT_LEVEL = undefined;
    });
  });
});
