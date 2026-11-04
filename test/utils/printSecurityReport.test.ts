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
});
