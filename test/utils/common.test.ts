import { expect } from 'chai';
import { isJsonString, shortenNodePath } from '../../src/utils/common';

describe('Common utils', () => {
  describe('#isJsonString', () => {
    it('should return true for valid JSON object', () => {
      expect(isJsonString(JSON.stringify({ a: 1, b: { c: 2 } }))).to.equal(true);
    });

    it('should return false if it is not a valid JSON object', () => {
      expect(isJsonString('abc')).to.equal(false);
    });
  });

  describe('#shortenNodePath', () => {
    it('should be able to shorten node path correctly', () => {
      expect(shortenNodePath('node_modules/nodemon')).to.equal('nodemon');
      expect(
        shortenNodePath(
          'node_modules/nodemon/node_modules/chokidar/node_modules/fsevents/node_modules/node-pre-gyp/node_modules/rc/node_modules/ini',
        ),
      ).to.equal('nodemon>chokidar>fsevents>node-pre-gyp>rc>ini');
    });
  });
});

export {};
