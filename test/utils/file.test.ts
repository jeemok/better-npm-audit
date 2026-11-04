import fs from 'fs';
import os from 'os';
import path from 'path';
import sinon from 'sinon';
import { expect } from 'chai';
import { readFile } from '../../src/utils/file';

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
});
