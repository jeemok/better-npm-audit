import { expect } from 'chai';
import { color, getSeverityBgColor } from '../../src/utils/color';

describe('Color utils', () => {
  let originalNoColor: string | undefined;

  before(() => {
    originalNoColor = process.env.NO_COLOR;
    delete process.env.NO_COLOR;
  });

  after(() => {
    if (originalNoColor !== undefined) {
      process.env.NO_COLOR = originalNoColor;
    } else {
      delete process.env.NO_COLOR;
    }
  });

  describe('#color', () => {
    it('should handle correctly without given colors specificed', () => {
      expect(color('message')).to.equal('message\u001b[0m');
    });

    it('should be able to color message foreground correctly', () => {
      expect(color('message', 'black')).to.equal('\u001b[30mmessage\u001b[0m');
      expect(color('message', 'red')).to.equal('\u001b[31mmessage\u001b[0m');
      expect(color('message', 'green')).to.equal('\u001b[32mmessage\u001b[0m');
      expect(color('message', 'yellow')).to.equal('\u001b[33mmessage\u001b[0m');
      expect(color('message', 'blue')).to.equal('\u001b[34mmessage\u001b[0m');
      expect(color('message', 'magenta')).to.equal('\u001b[35mmessage\u001b[0m');
      expect(color('message', 'cyan')).to.equal('\u001b[36mmessage\u001b[0m');
      expect(color('message', 'white')).to.equal('\u001b[37mmessage\u001b[0m');
    });

    it('should be able to color message background correctly', () => {
      expect(color('message', undefined, 'black')).to.equal('\u001b[40mmessage\u001b[0m');
      expect(color('message', undefined, 'red')).to.equal('\u001b[41mmessage\u001b[0m');
      expect(color('message', undefined, 'green')).to.equal('\u001b[42mmessage\u001b[0m');
      expect(color('message', undefined, 'yellow')).to.equal('\u001b[43mmessage\u001b[0m');
      expect(color('message', undefined, 'blue')).to.equal('\u001b[44mmessage\u001b[0m');
      expect(color('message', undefined, 'magenta')).to.equal('\u001b[45mmessage\u001b[0m');
      expect(color('message', undefined, 'cyan')).to.equal('\u001b[46mmessage\u001b[0m');
      expect(color('message', undefined, 'white')).to.equal('\u001b[47mmessage\u001b[0m');
    });

    it('should be able to color message foreground and background correctly', () => {
      expect(color('message', 'black', 'green')).to.equal('\u001b[30m\u001b[42mmessage\u001b[0m');
      expect(color('message', 'white', 'cyan')).to.equal('\u001b[37m\u001b[46mmessage\u001b[0m');
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
