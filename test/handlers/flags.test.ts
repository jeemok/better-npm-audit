import fs from 'fs';
import sinon from 'sinon';
import { expect } from 'chai';
import * as semver from 'semver';
import { CommandOptions } from '../../src/types';
import handleInput, { validateRegistryUrl, getPackageManager } from '../../src/handlers/handleInput';
import { getNpmVersion } from '../../src/utils/npm';

describe('Flags', () => {
  describe('default', () => {
    it('should be able to handle default correctly', () => {
      const callbackStub = sinon.stub();
      const options = {};

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);

      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--exclude', () => {
    it('should be able to pass exception IDs using the command flag smoothly', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { exclude: '1567,919' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds = ['1567', '919'];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      // with space
      options.exclude = '1567, 1902';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, ['1567', '1902'])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 1902')).to.equal(true);

      // string ID
      options.exclude = '1134,GWE-1234,888';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, ['1134', 'GWE-1234', '888'])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1134, GWE-1234, 888')).to.equal(true);

      consoleStub.restore();
    });

    it('should info log the vulnerabilities if it is only passed in command line', () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { exclude: '1567,919' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds = ['1567', '919'];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);

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
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);

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
      const npmVersion = getNpmVersion();
      const flag = semver.satisfies(npmVersion, '<=8.13.2') ? '--production' : '--omit=dev';
      const auditCommand = `npm audit ${flag}`;
      const auditLevel = 'info';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--skip-optional', () => {
    it('should be able to skip optional dependencies from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      const options = { skipOptional: true };
      const flag = semver.satisfies(getNpmVersion(), '<=8.13.2') ? '--no-optional' : '--omit=optional';
      const auditCommand = `npm audit ${flag}`;

      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'info', [])).to.equal(true);
    });
  });

  describe('--registry', () => {
    it('should be able to set registry from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      const options: CommandOptions = { registry: 'https://registry.npmjs.org/' };
      const auditCommand = 'npm audit --registry=https://registry.npmjs.org/';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--level', () => {
    it('should be able to pass audit level from the command flag correctly', () => {
      const callbackStub = sinon.stub();
      let options: CommandOptions = { level: 'info' };

      const auditCommand = 'npm audit';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, 'info', exceptionIds)).to.equal(true);

      options = { level: 'low' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'low', exceptionIds)).to.equal(true);

      options = { level: 'moderate' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'moderate', exceptionIds)).to.equal(true);

      options = { level: 'high' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'high', exceptionIds)).to.equal(true);

      options = { level: 'critical' };
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'critical', exceptionIds)).to.equal(true);
    });

    it('should be able to pass audit level from the environment variables correctly', () => {
      const callbackStub = sinon.stub();
      const options = {};
      const auditCommand = 'npm audit';

      // info
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'info';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'info')).to.equal(true);

      // low
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'low';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'low')).to.equal(true);

      // moderate
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'moderate';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'moderate')).to.equal(true);

      // high
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'high';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'high')).to.equal(true);

      // critical
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'critical';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'critical')).to.equal(true);

      // Clean up
      delete process.env.NPM_CONFIG_AUDIT_LEVEL;
    });
  });

  describe('--module-ignore', () => {
    it('should be able to pass module names using the command flag smoothly', () => {
      const callbackStub = sinon.stub();
      const options = { moduleIgnore: 'lodash,moment' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];
      const modulesToIgnore = ['lodash', 'moment'];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);

      // with space
      options.moduleIgnore = 'lodash, moment';

      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);

      // invalid exceptions
      options.moduleIgnore = 'lodash,undefined,moment';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);

      // invalid null
      options.moduleIgnore = 'lodash,null,moment';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);
    });
  });

  describe('--include-columns', () => {
    it('should be able to pass column names using the command flag smoothly', () => {
      const callbackStub = sinon.stub();
      const options = { includeColumns: 'ID,Module' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];
      const modulesToIgnore: string[] = [''];
      const columnsToInclude = ['ID', 'Module'];

      expect(callbackStub.called).to.equal(false);
      handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);

      // with space
      options.includeColumns = 'ID, Module';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);

      // invalid exceptions
      options.includeColumns = 'ID,undefined,Module';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);

      // invalid null
      options.includeColumns = 'ID,null,Module';
      handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);
    });
  });
});

describe('validateRegistryUrl', () => {
  it('should accept valid http(s) registry URLs', () => {
    ['https://registry.npmjs.org/', 'http://localhost:4873', 'https://user@host.example/npm/?a=1'].forEach((url) =>
      expect(validateRegistryUrl(url), url).to.equal(true),
    );
  });

  it('should reject shell metacharacters and other injection attempts', () => {
    [
      'https://x.com/;rm -rf /',
      'https://x.com/$(whoami)',
      'https://x.com/`id`',
      'https://x.com/ && echo hi',
      'https://x.com/|cat',
      `https://x.com/'`,
      'https://x.com/\nls',
      'https://x.com/a&b',
    ].forEach((url) => expect(validateRegistryUrl(url), url).to.equal(false));
  });

  it('should reject non-http protocols, garbage and empty values', () => {
    ['file:///etc/passwd', 'ftp://x.com', 'not a url', '', undefined, null].forEach((url) =>
      expect(validateRegistryUrl(url as unknown as string)).to.equal(false),
    );
  });

  describe('--package-manager', () => {
    afterEach(() => sinon.restore());

    const stubFiles = (present: string[]) => sinon.stub(fs, 'existsSync').callsFake((file) => present.includes(String(file)));

    it('should default to npm, and detect pnpm only from a pnpm lockfile without an npm one', () => {
      stubFiles([]);
      expect(getPackageManager()).to.equal('npm');
      sinon.restore();
      stubFiles(['pnpm-lock.yaml']);
      expect(getPackageManager()).to.equal('pnpm');
      sinon.restore();
      stubFiles(['pnpm-lock.yaml', 'package-lock.json']);
      expect(getPackageManager()).to.equal('npm');
    });

    it('should prefer the explicit flag over detection', () => {
      stubFiles(['pnpm-lock.yaml']);
      expect(getPackageManager('npm')).to.equal('npm');
    });

    it('should build a pnpm audit command with mapped flags', () => {
      const callbackStub = sinon.stub();
      handleInput({ packageManager: 'pnpm', production: true, skipOptional: true, registry: 'https://registry.npmjs.org/' }, callbackStub);
      expect(callbackStub.firstCall.args[0]).to.equal('pnpm audit --prod --no-optional --registry=https://registry.npmjs.org/');
    });

    it('should use pnpm when only pnpm-lock.yaml exists', () => {
      stubFiles(['pnpm-lock.yaml']);
      const callbackStub = sinon.stub();
      handleInput({}, callbackStub);
      expect(callbackStub.firstCall.args[0]).to.equal('pnpm audit');
    });

    it('should reject an unsupported package manager', () => {
      const exitStub = sinon.stub(process, 'exit').throws(new Error('exit'));
      sinon.stub(console, 'error');
      expect(() => handleInput({ packageManager: 'yarn' }, sinon.stub())).to.throw('exit');
      expect(exitStub.calledWith(1)).to.equal(true);
    });
  });
});
