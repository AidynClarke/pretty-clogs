/* eslint-disable @typescript-eslint/no-unused-vars */
import Colouriser from './colouriser.js';
import { filterObject } from './helpers.js';
import { LogLevel, NoRepetition } from './types.js';
import XIDColouriser from './xid_colouriser.js';

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

// function getLogLocation(config: Config, oldConsole: typeof console) {
//   const originalPrepareStackTrace = Error.prepareStackTrace;

//   try {
//     // Customize how stack traces are formatted
//     Error.prepareStackTrace = (err, stack) => stack;

//     const err = new Error();
//     const stack = err.stack;

//     // Skip frames: 0 = getCallerInfo, 1 = log method, 2+ = actual caller
//     const frameIndex = 2 + config.skipFrames;
//     const caller = stack?.[frameIndex] as any;

//     if (!caller) {
//       // return { file: 'unknown', line: 0, column: 0, function: 'unknown' };

//       return stack[2];

//       return `UNKNOWN`;
//     }

//     let fileName = caller.getFileName() || 'unknown';

//     // Optionally show only the file name, not full path
//     if (!config.showFullPath && fileName !== 'unknown') {
//       fileName = fileName.split('/').pop().split('\\').pop();
//     }

//     // let str = `${fileName}:${caller.getLineNumber() || 0}:${caller.getColumnNumber() || 0}`

//     const returnArr: string[] = [fileName, caller.getLineNumber() || 0, caller.getColumnNumber() || 0];
//     let str: string;

//     if (config.includeFunctionName) {
//       str = [returnArr[0], caller.getFunctionName() || 'anonymous', ...returnArr.slice(1)].join(':');
//     } else {
//       str = returnArr.join(':');
//     }

//     writeFileSync('test.txt', str);

//     oldConsole.log(str);

//     return str;

//     // return returnArr.join(':');

//     // return {
//     //   file: fileName,
//     //   line: caller.getLineNumber() || 0,
//     //   column: caller.getColumnNumber() || 0,
//     //   function: caller.getFunctionName() || 'anonymous'
//     // };
//   } finally {
//     // Restore original prepareStackTrace
//     Error.prepareStackTrace = originalPrepareStackTrace;
//   }
// }

// function getLogLocation(err: Error, config: Config): string | undefined {
//   const traceStack = err.stack;

//   if (traceStack === undefined) return;

//   const traceobj = formatDirectory(traceStack.split('\n')[2].split(cwd)[1]).split(':');
//   const file = traceobj[0];

//   const line = traceobj[1];
//   const column = traceobj[2];

//   return traceobj.toString();

//   // return `${file}:${line}:${column}`;
// }

// function formatLocation(info) {
//   return `${info.file}:${info.line}:${info.column}`;
// }

// function getLogLocation(config: Config) {
//   try {
//     // Get the string stack trace which source-map-support has already modified
//     const err = new Error();
//     const stackString = err.stack;

//     if (!stackString || typeof stackString !== 'string') {
//       return formatLocation({ file: 'unknown', line: 0, column: 0 });
//     }

//     const lines = stackString.split('\n');

//     // Stack lines:
//     // 0 = "Error"
//     // 1 = at getCallerInfo (...)
//     // 2 = at log/info/warn/error (...)
//     // 3 = at actual caller (what we want)
//     const frameIndex = 3 + (config.skipFrames ?? 0);

//     if (frameIndex >= lines.length) {
//       return formatLocation({ file: 'unknown', line: 0, column: 0 });
//     }

//     const line = lines[frameIndex];

//     if (!line || typeof line !== 'string') {
//       return formatLocation({ file: 'unknown', line: 0, column: 0 });
//     }

//     const trimmedLine = line.trim();

//     // Try multiple regex patterns for different stack formats
//     // Pattern 1: "at functionName (file:line:column)"
//     let match = trimmedLine.match(/at\s+.+?\s+\((.+?):(\d+):(\d+)\)/);

//     // Pattern 2: "at file:line:column"
//     if (!match) {
//       match = trimmedLine.match(/at\s+(.+?):(\d+):(\d+)/);
//     }

//     // Pattern 3: "(file:line:column)" at the end
//     if (!match) {
//       match = trimmedLine.match(/\((.+?):(\d+):(\d+)\)$/);
//     }

//     // Pattern 4: Just "file:line:column"
//     if (!match) {
//       match = trimmedLine.match(/([^:\s]+):(\d+):(\d+)/);
//     }

//     if (!match || match.length < 4) {
//       // Debug: show what we couldn't parse
//       return formatLocation({ file: `unparsed`, line: 0, column: 0 });
//     }

//     test.log(trimmedLine);

//     let fileName = match[1];
//     const lineNum = parseInt(match[2], 10);
//     const colNum = parseInt(match[3], 10);

//     // Optionally show only the file name, not full path
//     if (!config.showFullPath && fileName) {
//       const parts = fileName.split('/');
//       if (parts.length > 0) {
//         fileName = parts[parts.length - 1];
//       }
//     }

//     return formatLocation({ file: fileName || 'unknown', line: lineNum || 0, column: colNum || 0 });
//   } catch (e) {
//     return 'UNKNOWN';
//   }
// }

import path from 'path';

function formatLocation(info: any, includeFunction = false) {
  let location = '';
  let prefix = '';

  const fullFilePath = info.fullFile || info.file; // Use full path if available

  // Debug: log the file path we're checking
  if (process.env.DEBUG_LOGGER) {
    console.error('[DEBUG] Checking file:', fullFilePath, 'CWD:', cwd);
  }

  // Check if this is from node_modules (real external dependencies)
  const nodeModulesMatch = fullFilePath.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
  if (nodeModulesMatch) {
    prefix = `node_modules:${nodeModulesMatch[1]} `;
  } else {
    // // Check if this is from a workspace package
    // // Strategy 1: Check against configured workspace packages
    // for (const pkg of this.workspacePackages) {
    //   if (fullFilePath.includes(pkg) || fullFilePath.includes(pkg.replace('@', '').replace('/', '-'))) {
    //     prefix = `workspace:${pkg} `;
    //     break;
    //   }
    // }

    // Strategy 2: Check if file is outside current working directory (likely a workspace package)
    if (!prefix && fullFilePath.startsWith('/')) {
      const relativePath = path.resolve(fullFilePath);

      if (process.env.DEBUG_LOGGER) {
        console.error('[DEBUG] Resolved path:', relativePath);
        console.error('[DEBUG] Starts with CWD?', relativePath.startsWith(cwd));
      }

      // If the file is not in the current package's directory tree, it's likely external
      if (!relativePath.startsWith(cwd)) {
        // Try to extract package name from path (e.g., /path/to/packages/my-package/src/file.js)
        const packagesMatch = relativePath.match(/\/packages\/([^/]+)\//);
        if (packagesMatch) {
          prefix = `workspace:${packagesMatch[1]} `;
        } else {
          // Try to extract from any parent directory structure
          const pathParts = relativePath.split('/');
          const cwdParts = cwd.split('/');

          // Find where paths diverge
          let divergeIndex = 0;
          for (let i = 0; i < Math.min(pathParts.length, cwdParts.length); i++) {
            if (pathParts[i] !== cwdParts[i]) {
              divergeIndex = i;
              break;
            }
          }

          // Get the package name (directory after divergence point)
          if (divergeIndex < pathParts.length - 1) {
            const packageName = pathParts[divergeIndex];
            prefix = `external:${packageName} `;
          } else {
            prefix = 'external: ';
          }
        }
      }
    }
  }

  if (includeFunction && info.function && info.function !== 'anonymous' && info.function !== '<anonymous>') {
    location = `${info.file}:${info.function} @ ${info.line}:${info.column}`;
  } else {
    location = `${info.file}:${info.line}:${info.column}`;
  }

  return prefix + location;
}

function getLogLocation(config: Config) {
  try {
    // Get the string stack trace which source-map-support has already modified
    const err = new Error();
    const stackString = err.stack;

    if (!stackString || typeof stackString !== 'string') {
      return { file: 'unknown', line: 0, column: 0, function: 'unknown' };
    }

    const lines = stackString.split('\n');

    // Stack lines:
    // 0 = "Error"
    // 1 = at getCallerInfo (...)
    // 2 = at log/info/warn/error (...)
    // 3 = at actual caller (what we want)
    const frameIndex = 3 + (config.skipFrames ?? 0);

    if (frameIndex >= lines.length) {
      return { file: 'unknown', line: 0, column: 0, function: 'unknown' };
    }

    const line = lines[frameIndex];

    if (!line || typeof line !== 'string') {
      return { file: 'unknown', line: 0, column: 0, function: 'unknown' };
    }

    const trimmedLine = line.trim();

    let functionName = 'anonymous';
    let fileName = 'unknown';
    let lineNum = 0;
    let colNum = 0;

    // Pattern 1: "at functionName (file:line:column)"
    let match = trimmedLine.match(/at\s+([^\s]+)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      functionName = match[1];
      fileName = match[2];
      lineNum = parseInt(match[3], 10);
      colNum = parseInt(match[4], 10);
    } else {
      // Pattern 2: "at Object.functionName (file:line:column)"
      match = trimmedLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        functionName = match[1];
        fileName = match[2];
        lineNum = parseInt(match[3], 10);
        colNum = parseInt(match[4], 10);
      } else {
        // Pattern 3: "at file:line:column" (no function name)
        match = trimmedLine.match(/at\s+(.+?):(\d+):(\d+)/);
        if (match) {
          functionName = '<anonymous>';
          fileName = match[1];
          lineNum = parseInt(match[2], 10);
          colNum = parseInt(match[3], 10);
        }
      }
    }

    if (!match) {
      return { file: 'unparsed', line: 0, column: 0, function: 'unknown' };
    }

    // Optionally show only the file name, not full path
    let displayFileName = fileName;
    if (!config.showFullPath && fileName) {
      const parts = fileName.split('/');
      if (parts.length > 0) {
        displayFileName = parts[parts.length - 1];
      }
    }

    return {
      file: displayFileName || 'unknown',
      fullFile: fileName, // Keep full path for detection
      line: lineNum || 0,
      column: colNum || 0,
      function: functionName || 'unknown'
    };
  } catch (e) {
    return { file: 'error-caught', line: 0, column: 0, function: 'unknown' };
  }
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
  ...(config.enableXID && filterObject(xidLogger(oldCons, config), config.logLevels, (...args: any[]) => {})),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...(!config.enableXID && filterObject(logger(oldCons, config), config.logLevels, (...args: any[]) => {}))
});

export const xidLogger = (oldCons: Console, config: Config) => ({
  log: (ctx: string, ...args: any[]) => {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.log(`${start}${Colouriser.colouriseLogType('log')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },

  info(ctx: string, ...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.info(`${start}${Colouriser.colouriseLogType('info')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },
  warn(ctx: string, ...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.warn(`${start}${Colouriser.colouriseLogType('warn')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  },
  error(ctx: string, ...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.error(`${start}${Colouriser.colouriseLogType('error')} (${XIDColouriser.colouriseXID(ctx)})`, formatArgs(args));
  }
});

export const logger = (oldCons: Console, config: Config) => ({
  log: (...args: any[]) => {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.log(`${start}${Colouriser.colouriseLogType('log')}`, formatArgs(args));
  },

  info(...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.info(`${start}${Colouriser.colouriseLogType('info')}`, formatArgs(args));
  },
  warn(...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.warn(`${start}${Colouriser.colouriseLogType('warn')}`, formatArgs(args));
  },
  error(...args: any[]) {
    let start = '';

    if (config.includeTimestamp && config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;
    else if (config.includeTimestamp) start = `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')}] `;
    else if (config.includeLogLocation)
      start = `[${Colouriser.colouriseValue(formatLocation(getLogLocation(config), config.includeFunctionName), 'FG_GRAY')}] `;

    oldCons.error(`${start}${Colouriser.colouriseLogType('error')}`, formatArgs(args));
  }
});
