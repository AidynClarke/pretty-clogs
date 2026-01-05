/* eslint-disable @typescript-eslint/lines-between-class-members */
const RESET = '\x1b[0m';

// apparently i've changed nothing since last commit - so here is the change you silly silly silly package manager

export type Primitive = string | number | boolean;
export function isPrimitive(value: unknown): value is Primitive {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export class Colours {
  private static NO_COLOUR = false;

  public static setConfig({ noColour }: { noColour: boolean }) {
    this.NO_COLOUR = noColour;
  }

  private static colourise(colour: number, text: Primitive): string {
    return this.NO_COLOUR ? `${text}` : `\x1b[${colour}m${text}${RESET}`;
  }
  public static readonly BOLD = this.colourise.bind(this, 1);
  public static readonly DIM = this.colourise.bind(this, 2);
  public static readonly UNDERSCORE = this.colourise.bind(this, 4);
  public static readonly BLINK = this.colourise.bind(this, 5);
  public static readonly REVERSE = this.colourise.bind(this, 7);
  public static readonly HIDDEN = this.colourise.bind(this, 8);
  public static readonly FG_BLACK = this.colourise.bind(this, 30);
  public static readonly FG_RED = this.colourise.bind(this, 31);
  public static readonly FG_GREEN = this.colourise.bind(this, 32);
  public static readonly FG_YELLOW = this.colourise.bind(this, 33);
  public static readonly FG_BLUE = this.colourise.bind(this, 34);
  public static readonly FG_MAGENTA = this.colourise.bind(this, 35);
  public static readonly FG_CYAN = this.colourise.bind(this, 36);
  public static readonly FG_WHITE = this.colourise.bind(this, 37);
  public static readonly FG_GRAY = this.colourise.bind(this, 90);
  public static readonly FG_RED_BRIGHT = this.colourise.bind(this, 91);
  public static readonly FG_GREEN_BRIGHT = this.colourise.bind(this, 92);
  public static readonly FG_YELLOW_BRIGHT = this.colourise.bind(this, 93);
  public static readonly FG_BLUE_BRIGHT = this.colourise.bind(this, 94);
  public static readonly FG_MAGENTA_BRIGHT = this.colourise.bind(this, 95);
  public static readonly FG_CYAN_BRIGHT = this.colourise.bind(this, 96);
  public static readonly FG_WHITE_BRIGHT = this.colourise.bind(this, 97);
  public static readonly BG_BLACK = this.colourise.bind(this, 40);
  public static readonly BG_RED = this.colourise.bind(this, 41);
  public static readonly BG_GREEN = this.colourise.bind(this, 42);
  public static readonly BG_YELLOW = this.colourise.bind(this, 43);
  public static readonly BG_BLUE = this.colourise.bind(this, 44);
  public static readonly BG_MAGENTA = this.colourise.bind(this, 45);
  public static readonly BG_CYAN = this.colourise.bind(this, 46);
  public static readonly BG_WHITE = this.colourise.bind(this, 47);
  public static readonly BG_GRAY = this.colourise.bind(this, 100);
}

type ColourFunctions = Omit<Omit<Omit<typeof Colours, 'prototype'>, 'setConfig'>, 'NO_COLOUR'>;
export type ColourKeys = keyof ColourFunctions;

export type Condition = {
  type: 'matches' | 'includes' | 'does-not-match' | 'does-not-include';
  value: string;
};

export function getRandomColour(...blacklist: Condition[]): (text: Primitive) => string {
  const keys = Object.keys(Colours) as ColourKeys[];

  const allowedColours: ((text: Primitive) => string)[] = [];

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
