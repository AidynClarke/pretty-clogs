import Colouriser, { XIDColouriser } from './colouriser';

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

function getLogLocation(err: Error, oldLog?: Console): string | undefined {
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

const c = (function (oldCons) {
  return {
    log: (ctx: string, ...args: any[]) => {
      oldCons.log(
        `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error(''), oldCons), 'FG_GRAY')}] ${Colouriser.colouriseLogType('DEBUG')} (${XIDColouriser.colouriseXID(ctx)})`,
        ...formatArgs(args)
      );
    },

    info: function (ctx: string, ...args: any[]) {
      oldCons.info(
        `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('INFO')} (${XIDColouriser.colouriseXID(ctx)})`,
        ...formatArgs(args)
      );
    },
    warn: function (ctx: string, ...args: any[]) {
      oldCons.warn(
        `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('WARN')} (${XIDColouriser.colouriseXID(ctx)})`,
        ...formatArgs(args)
      );
    },
    error: function (ctx: string, ...args: any[]) {
      oldCons.error(
        `[${Colouriser.colouriseValue(getTimeStamp(), 'FG_GRAY')} | ${Colouriser.colouriseValue(getLogLocation(new Error('')), 'FG_GRAY')}] ${Colouriser.colouriseLogType('ERROR')} (${XIDColouriser.colouriseXID(ctx)})`,
        ...formatArgs(args)
      );
    }
  };
})(global.console);

global.console = c as any;
