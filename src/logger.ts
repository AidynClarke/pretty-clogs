/* eslint-disable @typescript-eslint/no-unused-vars */
import Colouriser from './colouriser';
import { filterObject } from './helpers';
import { LogLevel, NoRepetition } from './types';
import XIDColouriser from './xid_colouriser';

const test = { ...global.console };

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

export const initLogger = (oldCons: Console, config: Config) => ({
  ...oldCons,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...(config.enableXID &&
    filterObject(xidLogger(oldCons, config.includeLogLocation, config.includeTimestamp), config.logLevels, (...args: any[]) => {})),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...(!config.enableXID &&
    filterObject(logger(oldCons, config.includeLogLocation, config.includeTimestamp), config.logLevels, (...args: any[]) => {}))
});

const xidLogger = (oldCons: Console, includeTimestamp: boolean, includeLogLocation: boolean) => ({
  log: (ctx: string, ...args: any[]) => {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.log(`${start}${Colouriser.colouriseLogType('log')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },

  info(ctx: string, ...args: any[]) {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.info(`${start}${Colouriser.colouriseLogType('info')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },
  warn(ctx: string, ...args: any[]) {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.warn(`${start}${Colouriser.colouriseLogType('warn')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },
  error(ctx: string, ...args: any[]) {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.error(`${start}${Colouriser.colouriseLogType('error')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  }
});

const logger = (oldCons: Console, includeTimestamp: boolean, includeLogLocation: boolean) => ({
  log: (...args: any[]) => {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.log(`${start}${Colouriser.colouriseLogType('log')}`, formatArgs(args));
  },

  info(...args: any[]) {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.info(`${start}${Colouriser.colouriseLogType('info')}`, formatArgs(args));
  },
  warn(...args: any[]) {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.warn(`${start}${Colouriser.colouriseLogType('warn')}`, formatArgs(args));
  },
  error(...args: any[]) {
    let start = '';

    if (includeTimestamp && includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;
    else if (includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] `;

    oldCons.error(`${start}${Colouriser.colouriseLogType('error')}`, formatArgs(args));
  }
});
