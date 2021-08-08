import sinon from 'sinon';
import { expect } from 'chai';

import { ParsedCommandOptions } from '../../src/types';

import handleAudit from '../../src/handlers/handleAudit';

describe('Handle audit response', () => {
  it('should exit if unable to process the JSON buffer', () => {
    const processStub = sinon.stub(process, 'exit');
    const consoleStub = sinon.stub(console, 'error');
    const jsonBuffer = '';
    const options: ParsedCommandOptions = { level: 'info', scanModules: false };
    const exceptionIds: number[] = [];

    expect(processStub.called).to.equal(false);
    expect(consoleStub.called).to.equal(false);

    handleAudit(jsonBuffer, exceptionIds, options);

    expect(processStub.called).to.equal(true);
    expect(processStub.calledWith(1)).to.equal(true);

    expect(consoleStub.called).to.equal(true);
    expect(consoleStub.calledWith('Unable to process the JSON buffer string.')).to.equal(true);

    processStub.restore();
    consoleStub.restore();
  });
});
