import { expect } from 'chai';
import { color, getSeverityBgColor } from '../../src/utils/color';

describe('Color utils', () => {
  describe('#color', () => {
    it('should handle correctly without given colors specificed', () => {
      expect(color('message')).to.equal('message\\x1b[0m');
    });

    it('should be able to color message foreground correctly', () => {
      expect(color('message', 'black')).to.equal('\\033[30mmessage\\x1b[0m');
      expect(color('message', 'red')).to.equal('\\033[31mmessage\\x1b[0m');
      expect(color('message', 'green')).to.equal('\\033[32mmessage\\x1b[0m');
      expect(color('message', 'yellow')).to.equal('\\033[33mmessage\\x1b[0m');
      expect(color('message', 'blue')).to.equal('\\033[34mmessage\\x1b[0m');
      expect(color('message', 'magenta')).to.equal('\\033[35mmessage\\x1b[0m');
      expect(color('message', 'cyan')).to.equal('\\033[36mmessage\\x1b[0m');
      expect(color('message', 'white')).to.equal('\\033[37mmessage\\x1b[0m');
    });

    it('should be able to color message background correctly', () => {
      expect(color('message', undefined, 'black')).to.equal('\\033[40mmessage\\x1b[0m');
      expect(color('message', undefined, 'red')).to.equal('\\033[41mmessage\\x1b[0m');
      expect(color('message', undefined, 'green')).to.equal('\\033[42mmessage\\x1b[0m');
      expect(color('message', undefined, 'yellow')).to.equal('\\033[43mmessage\\x1b[0m');
      expect(color('message', undefined, 'blue')).to.equal('\\033[44mmessage\\x1b[0m');
      expect(color('message', undefined, 'magenta')).to.equal('\\033[45mmessage\\x1b[0m');
      expect(color('message', undefined, 'cyan')).to.equal('\\033[46mmessage\\x1b[0m');
      expect(color('message', undefined, 'white')).to.equal('\\033[47mmessage\\x1b[0m');
    });

    it('should be able to color message foreground and background correctly', () => {
      expect(color('message', 'black', 'green')).to.equal('\\033[30m\\033[42mmessage\\x1b[0m');
      expect(color('message', 'white', 'cyan')).to.equal('\\033[37m\\033[46mmessage\\x1b[0m');
    });
  });

  describe('#getSeverityBgColor', () => {
    it('should return correctly', () => {
      expect(getSeverityBgColor('info')).to.equal(undefined);
      expect(getSeverityBgColor('low')).to.equal(undefined);
      expect(getSeverityBgColor('moderate')).to.equal(undefined);
      expect(getSeverityBgColor('high')).to.equal('red');
      expect(getSeverityBgColor('critical')).to.equal('red');
    });
  });
});
