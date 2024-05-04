const RESET = '\x1b[0m';

type Primitives = string | number | boolean;

export const Colours = {
  BOLD: (text: Primitives) => `\x1b[1m${text}${RESET}`,
  DIM: (text: Primitives) => `\x1b[2m${text}${RESET}`,
  UNDERSCORE: (text: Primitives) => `\x1b[4m${text}${RESET}`,
  BLINK: (text: Primitives) => `\x1b[5m${text}${RESET}`,
  REVERSE: (text: Primitives) => `\x1b[7m${text}${RESET}`,
  HIDDEN: (text: Primitives) => `\x1b[8m${text}${RESET}`,
  FG_BLACK: (text: Primitives) => `\x1b[30m${text}${RESET}`,
  FG_RED: (text: Primitives) => `\x1b[31m${text}${RESET}`,
  FG_GREEN: (text: Primitives) => `\x1b[32m${text}${RESET}`,
  FG_YELLOW: (text: Primitives) => `\x1b[33m${text}${RESET}`,
  FG_BLUE: (text: Primitives) => `\x1b[34m${text}${RESET}`,
  FG_MAGENTA: (text: Primitives) => `\x1b[35m${text}${RESET}`,
  FG_CYAN: (text: Primitives) => `\x1b[36m${text}${RESET}`,
  FG_WHITE: (text: Primitives) => `\x1b[37m${text}${RESET}`,
  FG_GRAY: (text: Primitives) => `\x1b[90m${text}${RESET}`,
  FG_RED_BRIGHT: (text: Primitives) => `\x1b[31m${text}${RESET}`,
  FG_GREEN_BRIGHT: (text: Primitives) => `\x1b[32m${text}${RESET}`,
  FG_YELLOW_BRIGHT: (text: Primitives) => `\x1b[33m${text}${RESET}`,
  FG_BLUE_BRIGHT: (text: Primitives) => `\x1b[34m${text}${RESET}`,
  FG_MAGENTA_BRIGHT: (text: Primitives) => `\x1b[35m${text}${RESET}`,
  FG_CYAN_BRIGHT: (text: Primitives) => `\x1b[36m${text}${RESET}`,
  FG_WHITE_BRIGHT: (text: Primitives) => `\x1b[37m${text}${RESET}`,
  BG_BLACK: (text: Primitives) => `\x1b[40m${text}${RESET}`,
  BG_RED: (text: Primitives) => `\x1b[41m${text}${RESET}`,
  BG_GREEN: (text: Primitives) => `\x1b[42m${text}${RESET}`,
  BG_YELLOW: (text: Primitives) => `\x1b[43m${text}${RESET}`,
  BG_BLUE: (text: Primitives) => `\x1b[44m${text}${RESET}`,
  BG_MAGENTA: (text: Primitives) => `\x1b[45m${text}${RESET}`,
  BG_CYAN: (text: Primitives) => `\x1b[46m${text}${RESET}`,
  BG_WHITE: (text: Primitives) => `\x1b[47m${text}${RESET}`,
  BG_GRAY: (text: Primitives) => `\x1b[100m${text}${RESET}`
};

export type Colours = keyof typeof Colours;

export type Condition = {
  type: 'matches' | 'includes' | 'does-not-match' | 'does-not-include';
  value: string;
};

export function getRandomColour(...blacklist: Condition[]): (text: Primitives) => string {
  const keys = Object.keys(Colours) as (keyof typeof Colours)[];

  const allowedColours: ((text: Primitives) => string)[] = [];

  for (const key of keys) {
    if (shouldBlacklist(key, blacklist)) continue;
    allowedColours.push(Colours[key]);
  }

  return allowedColours[Math.floor(Math.random() * allowedColours.length)];
}

function shouldBlacklist(colour: string, conditions: Condition[]) {
  for (const condition of conditions) {
    switch (condition.type) {
      case 'matches':
        if (new RegExp(condition.value).test(colour)) {
          return true;
        }
        break;
      case 'includes':
        if (colour.includes(condition.value)) {
          return true;
        }
        break;
      case 'does-not-match':
        if (!new RegExp(condition.value).test(colour)) {
          return true;
        }
        break;
      case 'does-not-include':
        if (!colour.includes(condition.value)) {
          return true;
        }
        break;
    }
  }
  return false;
}
