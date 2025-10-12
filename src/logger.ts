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

  showFullPath: boolean;
  skipFrames: number;
  includeFunctionName: boolean;
}

export const defaultConfig: Config = {
  enableXID: false,
  logLevels: ['error', 'warn', 'info', 'log'],
  enableColours: true,
  includeTimestamp: true,
  includeLogLocation: true,
  showFullPath: false,
  skipFrames: 0,
  includeFunctionName: false
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

// function getLogLocation(e?: Error) {
//   const stack = new Error().stack?.split('\n')?.slice(3); // skip first lines (Error + getCaller + console wrapper)
//   console.log(stack);

//   // Find the first line that isn't in node internals or this file
//   const line = stack?.find((line) => !line.includes('internal/') && !line.includes('node:internal') && !line.includes(__filename));

//   // Extract the file:line:column part
//   const match = line?.match(/\(([^)]+)\)/) || line?.match(/at (.+)/);

//   console.log(line);
//   console.log(match);

//   return match ? match[1] : 'unknown';
// }

// function getLogLocation(e?: Error) {
//   const old = Error.prepareStackTrace;
//   Error.prepareStackTrace = (_, stack) => stack;
//   const err = new Error();
//   const stack = err.stack;
//   Error.prepareStackTrace = old;
//   const frame = stack?.[3]; // skip internal frames

//   console.log((frame as any).getFileName());
//   console.log((frame as any).getLineNumber());

//   return `${(frame as any).getFileName()}:${(frame as any).getLineNumber()}`;
// }

function getLogLocation(config: Config) {
  const originalPrepareStackTrace = Error.prepareStackTrace;

  try {
    // Customize how stack traces are formatted
    Error.prepareStackTrace = (err, stack) => stack;

    const err = new Error();
    const stack = err.stack;

    // Skip frames: 0 = getCallerInfo, 1 = log method, 2+ = actual caller
    const frameIndex = 2 + config.skipFrames;
    const caller = stack?.[frameIndex] as any;

    if (!caller) {
      return { file: 'unknown', line: 0, column: 0, function: 'unknown' };
    }

    let fileName = caller.getFileName() || 'unknown';

    // Optionally show only the file name, not full path
    if (!config.showFullPath && fileName !== 'unknown') {
      fileName = fileName.split('/').pop().split('\\').pop();
    }

    // let str = `${fileName}:${caller.getLineNumber() || 0}:${caller.getColumnNumber() || 0}`

    const returnArr: string[] = [fileName, caller.getLineNumber() || 0, caller.getColumnNumber() || 0];

    if (config.includeFunctionName) {
      return [returnArr[0], caller.getFunctionName() || 'anonymous', ...returnArr.slice(1)].join(':');
    }

    return returnArr.join(':');

    // return {
    //   file: fileName,
    //   line: caller.getLineNumber() || 0,
    //   column: caller.getColumnNumber() || 0,
    //   function: caller.getFunctionName() || 'anonymous'
    // };
  } finally {
    // Restore original prepareStackTrace
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
}

// function getLogLocation(err: Error): string | undefined {
//   const traceStack = err.stack;

//   if (traceStack === undefined) return;

//   const traceobj = formatDirectory(traceStack.split('\n')[2].split(cwd)[1]).split(':');
//   const file = traceobj[0];

//   const line = traceobj[1];
//   const column = traceobj[2];

//   return `${file}:${line}:${column}`;
// }

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
  ...(config.enableXID && filterObject(xidLogger(oldCons, config), config.logLevels, (...args: any[]) => {})),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...(!config.enableXID && filterObject(logger(oldCons, config), config.logLevels, (...args: any[]) => {}))
});

export const xidLogger = (oldCons: Console, config: Config) => ({
  log: (ctx: string, ...args: any[]) => {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.log(`${start}${Colouriser.colouriseLogType('log')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },

  info(ctx: string, ...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.info(`${start}${Colouriser.colouriseLogType('info')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },
  warn(ctx: string, ...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.warn(`${start}${Colouriser.colouriseLogType('warn')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },
  error(ctx: string, ...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.error(`${start}${Colouriser.colouriseLogType('error')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  }
});

export const logger = (oldCons: Console, config: Config) => ({
  log: (...args: any[]) => {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.log(`${start}${Colouriser.colouriseLogType('log')}`, formatArgs(args));
  },

  info(...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.info(`${start}${Colouriser.colouriseLogType('info')}`, formatArgs(args));
  },
  warn(...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.warn(`${start}${Colouriser.colouriseLogType('warn')}`, formatArgs(args));
  },
  error(...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation) start = `[${Colouriser.colouriseValue(getLogLocation(config), 'FG_GRAY')}] `;

    oldCons.error(`${start}${Colouriser.colouriseLogType('error')}`, formatArgs(args));
  }
});
