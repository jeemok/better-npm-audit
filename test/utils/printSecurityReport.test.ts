import sinon from 'sinon';
import { expect } from 'chai';
import { printSecurityReport } from '../../src/utils/print';

describe('printSecurityReport', () => {
  afterEach(() => sinon.restore());

  const longTitle = 'Inefficient Regular Expression Complexity in chalk/ansi-regex and a few more words to force wrapping of this text';

  it('should wrap the Title column even when only some columns are included', () => {
    const infoStub = sinon.stub(console, 'info');
    printSecurityReport([['ansi-regex', longTitle, 'high']], ['Module', 'Title', 'Severity']);

    const output: string = infoStub.firstCall.args[0];
    // Every word of the title is kept, and none of the lines exceeds the max column width
    longTitle.split(' ').forEach((word) => expect(output).to.include(word));
    output.split('\n').forEach((line) => expect(line.length).to.be.lessThan(120));
  });

  it('should keep every word of wrapped titles in the full report', () => {
    const infoStub = sinon.stub(console, 'info');
    printSecurityReport([['1', 'ansi-regex', longTitle, 'a\nb\nc', 'high', 'https://x.y/z', 'n']], []);

    const output: string = infoStub.firstCall.args[0];
    longTitle.split(' ').forEach((word) => expect(output).to.include(word));
  });

  describe('terminal width', () => {
    const row = [
      '1',
      'ansi-regex',
      longTitle,
      'some-package > another-package > ansi-regex\nsome-package > yet-another-package > ansi-regex',
      'high',
      'https://github.com/advisories/GHSA-93q8-gq69-wqmw',
      'n',
    ];
    // eslint-disable-next-line no-control-regex
    const strip = (text: string) => text.replace(/\u001b\[[0-9;]*m/g, '');
    const render = (width: number | undefined) => {
      const infoStub = sinon.stub(console, 'info');
      printSecurityReport([row], [], width);
      const output: string = infoStub.firstCall.args[0];
      infoStub.restore();
      return output;
    };

    [80, 121].forEach((width) => {
      it(`should keep every line within ${width} columns`, () => {
        render(width)
          .split('\n')
          .forEach((line) => expect(strip(line).length).to.be.at.most(width));
      });
    });

    it('should keep every word and the whole URL on one line when there is room', () => {
      const output = render(1000);
      longTitle.split(' ').forEach((word) => expect(output).to.include(word));
      expect(output).to.include('https://github.com/advisories/GHSA-93q8-gq69-wqmw');
    });

    it('should still fit a very narrow terminal by breaking up the URL', () => {
      render(100)
        .split('\n')
        .forEach((line) => expect(strip(line).length).to.be.at.most(100));
    });

    it('should not change the output when the width is unknown', () => {
      expect(render(undefined)).to.equal(render(1000));
    });
  });
});
