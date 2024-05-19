/* eslint-disable @typescript-eslint/no-unused-vars */
import Colouriser from './colouriser';
import { filterObject } from './helpers';
import { LogLevel, NoRepetition } from './types';
import XIDColouriser from './xid_colouriser';

export interface Config {
  /**
   * When enabled, the first argument in console.<log | info | warn | error> is treated as an XID.
   * @default false
   */
  enableXID: boolean;

  /**
   * Defines the log levels that will be displayed in the console
   * @default ['error', 'warn', 'info', 'log']
   */
  logLevels: NoRepetition<LogLevel>;

  /**
   * Enables colours in the console
   * @default true
   */
  enableColours: boolean;

  /**
   * Includes a timestamp in the console
   * @default true
   */
  includeTimestamp: boolean;

  /**
   * Includes a log location in the console
   * @default true
   */
  includeLogLocation: boolean;
}

export const defaultConfig: Config = {
  enableXID: false,
  logLevels: ['error', 'warn', 'info', 'log'],
  enableColours: true,
  includeTimestamp: true,
  includeLogLocation: true
};

let cwd = process.cwd();
if (cwd[0] === 'C') cwd = cwd.slice(1);
function formatDirectory(dir: string) {
  let formattedDir = dir;
  if (!formattedDir) return '';

  while (formattedDir.includes('\\')) {
    formattedDir = formattedDir.replace('\\', '/');
  }

  if (formattedDir[formattedDir.length - 1] === ')') formattedDir = formattedDir.slice(0, formattedDir.length - 1);
  if (formattedDir[0] === '/') formattedDir = formattedDir.slice(1);

  return formattedDir;
}

function getLogLocation(err: Error): string | undefined {
  const traceStack = err.stack;

  if (traceStack === undefined) return;

  const traceobj = formatDirectory(traceStack.split('\n')[2].split(cwd)[1]).split(':');
  const file = traceobj[0];

  const line = traceobj[1];
  const column = traceobj[2];

  return `${file}:${line}:${column}`;
}

function getTimeStamp(): string {
  return new Date().toLocaleTimeString().toUpperCase();
}

function formatArgs(args: any[], isXID: boolean = false) {
  if (args.length === 0) return '';
  const formattedArgs: any[] = [];

  for (const arg of args) {
    formattedArgs.push(Colouriser.colouriseValue(arg));
  }

  const offset = isXID ? 1 : 0;

  if (formattedArgs.length === 1 + offset) return formattedArgs[0];
  if (formattedArgs.length === 2 + offset) return `${formattedArgs[0]}: ${formattedArgs[1]}`;
  return `${formattedArgs[0]}: [\n  ${formattedArgs.slice(1).join(',\n  ')}\n]`;
}

export const initLogger = (oldCons: Console, config: Config) => {
  const loggers: any = {};

  for (const level of defaultConfig.logLevels) {
    if (config.logLevels.find((l) => l === level)) {
      loggers[level] = logger(oldCons, level, config.enableXID, config.includeTimestamp, config.includeLogLocation);
    } else loggers[level] = (...args: any[]) => {};
  }

  return {
    ...oldCons,
    ...loggers
  };
};

export const logger =
  (
    oldCons: Console,
    type: LogLevel,
    withXID: boolean = defaultConfig.enableXID,
    withTimestamp: boolean = defaultConfig.includeTimestamp,
    withLogLocation: boolean = defaultConfig.includeLogLocation
  ) =>
  (ctx: string, ...args: any[]) => {
    oldCons[type](
      `${getTimestampLogLocationSection(withTimestamp, withLogLocation)}${Colouriser.colouriseLogType(type)}${withXID ? ` (${XIDColouriser.colouriseXID(ctx)})` : ''}`,
      formatArgs(withXID ? args : [ctx, ...args])
    );
  };

function getTimestampLogLocationSection(withTimestamp: boolean, withLogLocation: boolean): string {
  let str = '';
  if (withTimestamp) str += `${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}`;
  if (withLogLocation) str += `${str.length > 0 ? ' | ' : ''}${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}`;
  return str.length > 0 ? `[${str}] ` : '';
}
