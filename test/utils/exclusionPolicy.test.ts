import { expect } from 'chai';
import { getExclusionPolicyErrors } from '../../src/utils/exclusionPolicy';

describe('Exclusion policy', () => {
  const now = new Date('2024-01-01T00:00:00Z').getTime();

  it('should pass when no policy flags are set', () => {
    expect(getExclusionPolicyErrors({ '1': { active: true } }, {}, now)).to.deep.equal([]);
  });

  describe('--require-notes', () => {
    it('should fail objects without notes and accept string notes', () => {
      const nsprc = { '1': { active: true }, '2': 'a note', '3': { notes: 'ok' } };
      expect(getExclusionPolicyErrors(nsprc, { requireNotes: true }, now)).to.deep.equal(['Exclusion 1 in .nsprc is missing notes']);
    });
  });

  describe('--require-expiry', () => {
    it('should fail string notes and objects without expiry', () => {
      const nsprc = { '1': 'a note', '2': { notes: 'x' }, '3': { expiry: '2024-02-01' }, '4': { expiry: 1706745600000 } };
      expect(getExclusionPolicyErrors(nsprc, { requireExpiry: true }, now)).to.deep.equal([
        'Exclusion 1 in .nsprc is missing an expiry date',
        'Exclusion 2 in .nsprc is missing an expiry date',
      ]);
    });
  });

  describe('--max-expiry-days', () => {
    it('should fail only exclusions that expire beyond the limit', () => {
      const nsprc = {
        '1': { expiry: '2024-01-20' },
        '2': { expiry: '2024-03-01' },
        '3': { expiry: '2023-01-01' },
        '4': { notes: 'no expiry' },
      };
      expect(getExclusionPolicyErrors(nsprc, { maxExpiryDays: 30 }, now)).to.deep.equal([
        'Exclusion 2 in .nsprc expires too far in the future (maximum 30 days from today)',
      ]);
    });

    it('should accept the value as a string from the command line', () => {
      expect(getExclusionPolicyErrors({ '1': { expiry: '2024-03-01' } }, { maxExpiryDays: '30' }, now)).to.have.length(1);
    });
  });
});
