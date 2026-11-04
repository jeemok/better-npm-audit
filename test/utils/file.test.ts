import fs from 'fs';
import os from 'os';
import path from 'path';
import sinon from 'sinon';
import { expect } from 'chai';
import { readFile, findNsprcModule, loadNsprcModule, readLockfilePackages } from '../../src/utils/file';

describe('File', () => {
  describe('#readFile', () => {
    afterEach(() => sinon.restore());

    it('should parse a JSON .nsprc file', () => {
      const result = readFile(path.join(__dirname, '../__mocks__/nsprc.json')) as Record<string, unknown>;
      expect(result).to.be.an('object');
      expect(result).to.have.property('1213');
    });

    it('should parse a YAML .nsprc file', () => {
      const result = readFile(path.join(__dirname, '../__mocks__/nsprc.yaml'));
      expect(result).to.deep.equal({ '1070404': { active: true, notes: 'my note', expiry: '2022-05-30' } });
    });

    it('should return false for a missing file', () => {
      expect(readFile('/nonexistent/.nsprc')).to.equal(false);
    });

    it('should return false for invalid or non-object content', () => {
      sinon.stub(console, 'log');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsprc-'));
      const bad = path.join(dir, 'bad');
      const scalar = path.join(dir, 'scalar');
      fs.writeFileSync(bad, 'a: [unclosed');
      fs.writeFileSync(scalar, 'just a string');
      expect(readFile(bad)).to.equal(false);
      expect(readFile(scalar)).to.equal(false);
    });
  });

  describe('JavaScript config', () => {
    let dir: string;
    beforeEach(() => (dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsprc-'))));
    afterEach(() => {
      sinon.restore();
      fs.rmSync(dir, { recursive: true, force: true });
    });

    const write = (name: string, content: string) => fs.writeFileSync(path.join(dir, name), content);

    it('should find .nsprc.cjs before .nsprc.js, and nothing when absent', () => {
      expect(findNsprcModule(dir)).to.equal(undefined);
      write('.nsprc.js', 'module.exports = {};');
      expect(findNsprcModule(dir)).to.equal('.nsprc.js');
      write('.nsprc.cjs', 'module.exports = {};');
      expect(findNsprcModule(dir)).to.equal('.nsprc.cjs');
    });

    it('should load an exported object', async () => {
      write('.nsprc.cjs', `module.exports = { 1234: { notes: 'ok' } };`);
      expect(await loadNsprcModule('.nsprc.cjs', dir)).to.deep.equal({ '1234': { notes: 'ok' } });
    });

    it('should load a default export', async () => {
      write('.nsprc.js', `exports.default = { 'GHSA-xxxx': 'fine' };`);
      expect(await loadNsprcModule('.nsprc.js', dir)).to.deep.equal({ 'GHSA-xxxx': 'fine' });
    });

    it('should await an async function export', async () => {
      write('.nsprc.cjs', `module.exports = async () => ({ 42: 'from async' });`);
      expect(await loadNsprcModule('.nsprc.cjs', dir)).to.deep.equal({ '42': 'from async' });
    });

    it('should exit with an error when the export is not an object', async () => {
      write('.nsprc.cjs', `module.exports = 'nope';`);
      const exitStub = sinon.stub(process, 'exit');
      const errorStub = sinon.stub(console, 'error');
      await loadNsprcModule('.nsprc.cjs', dir);
      expect(exitStub.calledWith(1)).to.equal(true);
      expect(errorStub.args[0][0]).to.match(/must export an object/);
    });

    it('should exit with an error when the module throws', async () => {
      write('.nsprc.cjs', `throw new Error('boom');`);
      const exitStub = sinon.stub(process, 'exit');
      const errorStub = sinon.stub(console, 'error');
      await loadNsprcModule('.nsprc.cjs', dir);
      expect(exitStub.calledWith(1)).to.equal(true);
      expect(errorStub.args[0][0]).to.match(/boom/);
    });
  });

  describe('#readLockfilePackages', () => {
    let dir: string;
    beforeEach(() => (dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lock-'))));
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

    it('should return the packages of package-lock.json', () => {
      fs.writeFileSync(
        path.join(dir, 'package-lock.json'),
        JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/a': { version: '1.0.0' } } }),
      );
      expect(readLockfilePackages(dir)).to.deep.equal({ 'node_modules/a': { version: '1.0.0' } });
    });

    it('should return undefined when there is no lockfile, or no packages field (lockfile v1)', () => {
      expect(readLockfilePackages(dir)).to.equal(undefined);
      fs.writeFileSync(path.join(dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1, dependencies: {} }));
      expect(readLockfilePackages(dir)).to.equal(undefined);
    });
  });
});
