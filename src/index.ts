import { Colours } from './colour.js';
import { deepCopy } from './helpers.js';
import { Config, defaultConfig, initLogger } from './logger.js';
import { DeepPartial } from './types.js';

function parseConfig<T extends object>(_default: T, input?: DeepPartial<T>): T {
  const parsedConfig = deepCopy(_default);
  if (!input) return parsedConfig;

  const keys = Object.keys(input) as (keyof typeof input)[];
  for (const key of keys) {
    if (input[key] !== undefined) parsedConfig[key as keyof T] = input[key] as never;
  }
  return parsedConfig;
}

export default class Logger {
  public static oldConsole = { ...global.console };

  public static init(config?: DeepPartial<Config>) {
    const parsedConfig = parseConfig(defaultConfig, config);
    if (!parsedConfig.enableColours) Colours.setConfig({ noColour: true });
    global.console = initLogger(this.oldConsole, parsedConfig);
  }

  public static createLocalLogger(xid: string, config: Omit<DeepPartial<Config>, 'enableXID'> = {}) {
    const _config = config as DeepPartial<Config>;
    _config.enableXID = true;

    const parsedConfig = parseConfig(defaultConfig, _config);
    if (!parsedConfig.enableColours) Colours.setConfig({ noColour: true });
    const logger = initLogger(this.oldConsole, parsedConfig);

    logger.log = logger.log.bind(this, xid);
    logger.info = logger.info.bind(this, xid);
    logger.warn = logger.warn.bind(this, xid);
    logger.error = logger.error.bind(this, xid);

    return logger;
  }
}
