import { expect } from 'chai';
import { isValidDate, analyzeExpiry } from '../../src/utils/date';

describe('Date utils', () => {
  describe('#isValidDate', () => {
    it('should be able to determine a valid UNIX timestamp correctly', () => {
      // Valid cases
      expect(isValidDate('2020-01-31')).to.equal(true);
      expect(isValidDate('2020/01/31')).to.equal(true);
      expect(isValidDate('01/31/2021')).to.equal(true);
      expect(isValidDate('01/31/2021, 11:03:58')).to.equal(true);
      expect(isValidDate('1 March 2016 15:00')).to.equal(true);
      expect(isValidDate('1 March 2016 3:00 pm')).to.equal(true);
      expect(isValidDate('1 Mar 2016')).to.equal(true);
      expect(isValidDate('1 March 2016')).to.equal(true);
      expect(isValidDate('March 1 2016')).to.equal(true);
      expect(isValidDate('Julai 1 2016')).to.equal(true);
      expect(isValidDate('Julei 1 2016')).to.equal(true);
      expect(isValidDate('Jul 11 2021')).to.equal(true);
      expect(isValidDate('Sun Jul 11 2021')).to.equal(true);
      expect(isValidDate('2020-01-01T00:00:00')).to.equal(true);
      expect(isValidDate('2020-01-01T00:00:00Z')).to.equal(true);
      expect(isValidDate('2020-01-01T00:00:00.000Z')).to.equal(true);
      expect(isValidDate('2012-01-26T13:51:50.417-07:00')).to.equal(true);
      expect(isValidDate('Sun, 11 Jul 2021 03:03:13 GMT')).to.equal(true);
      expect(isValidDate('Thu Jan 26 2017 11:00:00 GMT+1100 (Australian Eastern Daylight Time)')).to.equal(true);
      expect(isValidDate('Wed Jan 25 2017 16:00:00 GMT-0800 (Pacific Standard Time)')).to.equal(true);
      expect(isValidDate(1327611110417)).to.equal(true);

      // Invalid cases
      expect(isValidDate('1327611110417')).to.equal(false);
      expect(isValidDate('2020-31-01')).to.equal(false);
      expect(isValidDate('2020/31/01')).to.equal(false);
      expect(isValidDate('31/01/2021')).to.equal(false);
      expect(isValidDate('31-01-2021')).to.equal(false);
      expect(isValidDate('Unknown 1 2016')).to.equal(false);
      expect(isValidDate('2020-01-01T00:000:00')).to.equal(false);
      expect(isValidDate('11:03:58')).to.equal(false);
    });
  });

  describe('#analyzeExpiry', () => {
    it('should return valid and not expired if not given any date', () => {
      expect(analyzeExpiry()).to.deep.equal({ valid: true });
    });

    it('should be able to detect invalid dates', () => {
      expect(analyzeExpiry('2020-01-32', '2020-02-02')).to.deep.equal({ valid: false });
      expect(analyzeExpiry('2020-01-30', '2020-13-02')).to.deep.equal({ valid: false });
      expect(analyzeExpiry('2020-01-50')).to.deep.equal({ valid: false });
    });

    it('should be able to analyze the given timestamp correctly', () => {
      // Only dates
      expect(analyzeExpiry('2020-01-31', '2020-01-01')).to.deep.equal({ valid: true, expired: false });
      expect(analyzeExpiry('2020-01-31', '2020-01-31')).to.deep.equal({ valid: true, expired: false });
      expect(analyzeExpiry('2020-01-31', '2020-02-02')).to.deep.equal({ valid: true, expired: true });

      // Dates & time
      expect(analyzeExpiry('1 March 2020 3:00 pm', '1 March 2020 2:59:00 pm')).to.deep.equal({ valid: true, expired: false });
      expect(analyzeExpiry('1 March 2020 3:00 pm', '1 March 2020 3:00:00 pm')).to.deep.equal({ valid: true, expired: false });
      expect(analyzeExpiry('1 March 2020 3:00 pm', '1 March 2020 3:00:01 pm')).to.deep.equal({ valid: true, expired: true });

      // Milliseconds
      expect(analyzeExpiry(1327611110410, 1327611110409)).to.deep.equal({ valid: true, expired: false });
      expect(analyzeExpiry(1327611110410, 1327611110410)).to.deep.equal({ valid: true, expired: false });
      expect(analyzeExpiry(1327611110410, 1327611110411)).to.deep.equal({ valid: true, expired: true });
    });
  });
});
