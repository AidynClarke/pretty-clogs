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
}

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

function formatArgs(args: any[]) {
  const formattedArgs: any[] = [];

  for (const arg of args) {
    formattedArgs.push(Colouriser.colouriseValue(arg));
  }
  return formattedArgs;
}

export const initLogger = (oldCons: Console, config: Config) => ({
  ...oldCons,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...(config.enableXID && filterObject(xidLogger(oldCons), config.logLevels), (...args: any[]) => {}),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...(!config.enableXID && filterObject(logger(oldCons), config.logLevels), (...args: any[]) => {})
});

const xidLogger = (oldCons: Console) => ({
  log: (ctx: string, ...args: any[]) => {
    oldCons.log(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('DEBUG')} (${XIDColouriser.colouriseXID(ctx)})`,
      ...formatArgs(args)
    );
  },

  info(ctx: string, ...args: any[]) {
    oldCons.info(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('INFO')} (${XIDColouriser.colouriseXID(ctx)})`,
      ...formatArgs(args)
    );
  },
  warn(ctx: string, ...args: any[]) {
    oldCons.warn(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('WARN')} (${XIDColouriser.colouriseXID(ctx)})`,
      ...formatArgs(args)
    );
  },
  error(ctx: string, ...args: any[]) {
    oldCons.error(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('ERROR')} (${XIDColouriser.colouriseXID(ctx)})`,
      ...formatArgs(args)
    );
  }
});

const logger = (oldCons: Console) => ({
  log: (...args: any[]) => {
    oldCons.log(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('DEBUG')}`,
      ...formatArgs(args)
    );
  },

  info(...args: any[]) {
    oldCons.info(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('INFO')}`,
      ...formatArgs(args)
    );
  },
  warn(...args: any[]) {
    oldCons.warn(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('WARN')}`,
      ...formatArgs(args)
    );
  },
  error(...args: any[]) {
    oldCons.error(
      `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('ERROR')}`,
      ...formatArgs(args)
    );
  }
});
