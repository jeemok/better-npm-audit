import { expect } from 'chai';
import { isWholeNumber, isJsonString } from '../../src/utils/common';

describe('Common utils', () => {
  describe('#isJsonString', () => {
    it('should return true for valid JSON object', () => {
      expect(isJsonString(JSON.stringify({ a: 1, b: { c: 2 } }))).to.equal(true);
    });

    it('should return false if it is not a valid JSON object', () => {
      expect(isJsonString('abc')).to.equal(false);
    });
  });

  describe('#isWholeNumber', () => {
    it('should be able to determine a whole number', () => {
      expect(isWholeNumber(undefined)).to.equal(false);
      expect(isWholeNumber(0.14)).to.equal(false);
      expect(isWholeNumber(20.45)).to.equal(false);
      expect(isWholeNumber('')).to.equal(false);
      expect(isWholeNumber('2.50')).to.equal(false);
      expect(isWholeNumber(null)).to.equal(false);
      expect(isWholeNumber('true')).to.equal(false);

      expect(isWholeNumber(1)).to.equal(true);
      expect(isWholeNumber(2920)).to.equal(true);
      expect(isWholeNumber(934)).to.equal(true);
      expect(isWholeNumber('0920')).to.equal(true);
    });
  });
});

export {};
