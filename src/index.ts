import { deepCopy } from './helpers';
import { Config, initLogger } from './logger';
import { DeepPartial } from './types';

const defaultConfig: Config = {
  enableXID: false,
  logLevels: ['error', 'warn', 'info', 'log']
};

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
  public static init(config?: DeepPartial<Config>) {
    initLogger(global.console, parseConfig(defaultConfig, config));
  }
}
