import { Colours } from '../../src/colour';
import { logger } from '../../src/logger';
import { LogLevel } from '../../src/types';
import { obj, prettyObj } from './objects/object1';

Colours.setConfig({ noColour: true });

const logTypes: LogLevel[] = ['log', 'info', 'warn', 'error'];

function getInfoRegex(logType: string): RegExp {
  return new RegExp(`^\\[[0-9]+:[0-5][0-9]:[0-5][0-9] [A|P]M \\| [a-z/.]{1,}\\.\\w{1,}:\\d{1,}:\\d{1,}\\] ${logType}$`, 'g');
}

describe('logger', () => {
  it.each(logTypes)('should log a message with the correct timestamp, log location, and log type', (logType) => {
    const oldCons = console;
    const logSpy = jest.spyOn(oldCons, logType).mockImplementation();
    const logs = logger(oldCons, true, true)[logType];

    logs('test message');

    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(getInfoRegex(logType.toUpperCase())), 'test message');
    logSpy.mockRestore();
  });

  it.each(logTypes)('should log a message with the correct arguments', (logType) => {
    const oldCons = console;
    const logSpy = jest.spyOn(oldCons, logType).mockImplementation();
    const logs = logger(oldCons, true, true)[logType];

    logs('test message', obj);

    expect(logSpy.mock.calls[0][0]).toEqual(expect.stringMatching(getInfoRegex(logType.toUpperCase())));
    expect(logSpy.mock.calls[0][1]).toEqual(`test message: ` + prettyObj);

    logSpy.mockRestore();
  });
});
