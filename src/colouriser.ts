import { Colours, ColourKeys, Condition, getRandomColour, Primitive, isPrimitive } from './colour';
import { LogLevel } from './types';

export default class Colouriser {
  private static readonly allowedRandomColours: Condition[] = [
    { type: 'does-not-include', value: 'FG' },
    { type: 'includes', value: 'BLACK' },
    { type: 'includes', value: 'GRAY' },
    { type: 'includes', value: 'WHITE' }
  ];

  public static getRandomColour() {
    return getRandomColour(...this.allowedRandomColours);
  }

  public static colouriseLogType(type: LogLevel): string {
    if (type === 'log') return Colours.FG_MAGENTA(type.toUpperCase());
    if (type === 'info') return Colours.FG_BLUE_BRIGHT(type.toUpperCase());
    if (type === 'warn') return Colours.FG_YELLOW_BRIGHT(type.toUpperCase());
    if (type === 'error') return Colours.FG_RED_BRIGHT(type.toUpperCase());
    return type;
  }

  public static getStatusCodeWithColour(code: number) {
    if (code >= 500) return Colours.FG_RED_BRIGHT(code);
    if (code >= 400) return Colours.FG_YELLOW(code);
    if (code >= 300) return Colours.FG_BLUE_BRIGHT(code);
    if (code >= 200) return Colours.FG_GREEN_BRIGHT(code);
    return code;
  }

  public static getMethodWithColour(method: string) {
    switch (method) {
      case 'GET':
        return Colours.FG_GREEN_BRIGHT(method);
      case 'POST':
        return Colours.FG_YELLOW_BRIGHT(method);
      case 'PUT':
        return Colours.FG_BLUE_BRIGHT(method);
      case 'DELETE':
        return Colours.FG_RED_BRIGHT(method);
    }

    return method;
  }

  public static getNameColour(name: string) {
    let str: string;
    switch (name) {
      case 'API request':
        str = Colours.FG_CYAN_BRIGHT(name);
        break;
      case 'API response':
        str = Colours.FG_MAGENTA_BRIGHT(name);
        break;
      default:
        str = name;
        break;
    }

    return Colours.BOLD(str);
  }

  public static colouriseValue<T>(value: T, ...colours: ColourKeys[]): string {
    if (colours.length > 0) {
      let str: string = `${value}`;
      for (const colour of colours) str = Colours[colour](str);
      return str;
    }

    return this._colouriseValue(value, 1);
  }

  private static _colouriseValue<T>(value: T, depth: number): string {
    if (value === undefined || value === null) return Colours.FG_GRAY('null');
    if (isPrimitive(value)) {
      if (typeof value === 'string') {
        const strVal = depth === 1 ? value : `'${value}'`;
        return this._getValueColourFunction<string>(value)(strVal);
      }
      return this._getValueColourFunction(value)(value);
    }
    if (value instanceof Date) return Colours.FG_GREEN_BRIGHT(value.toISOString());
    if (value instanceof Array) return this.colouriseArray(value, depth);
    if (value instanceof Object) return this.colouriseObject(value, depth);

    return `${value}`;
  }

  private static _getValueColourFunction<T extends Primitive>(value: T, bright: boolean = true): (text: T) => string {
    if (typeof value === 'string') {
      if (value.toLowerCase().includes('invalid') || value.toLowerCase().includes('error')) {
        return bright ? Colours.FG_RED_BRIGHT : Colours.FG_RED;
      }
      return bright ? Colours.FG_BLUE_BRIGHT : Colours.FG_BLUE;
    }
    if (typeof value === 'number') return bright ? Colours.FG_CYAN_BRIGHT : Colours.FG_CYAN;
    if (typeof value === 'boolean') return bright ? Colours.FG_YELLOW_BRIGHT : Colours.FG_YELLOW;
    return (text: T) => `${text}`;
  }

  private static colouriseObject<T extends object | unknown[]>(obj: T, depth: number): string {
    const entries = Object.entries(obj);
    let str = `${Colours.FG_GRAY(`<object> (${entries.length} properties)`)} {`;
    if (entries.length === 0) return `${str}}`;
    if (entries.length === 1) return `${str} ${Colours.BOLD(entries[0][0])}: ${this._colouriseValue(entries[0][1], depth + 1)} }`;

    str += '\n';

    for (const [key, value] of entries) {
      str += `${this.getTabs(depth)}${Colours.BOLD(key)}: ${this._colouriseValue(value, depth + 1)},\n`;
    }

    return `${str + this.getTabs(depth - 1)}}`;
  }

  private static colouriseArray<T extends unknown[]>(arr: T, depth: number) {
    const { length } = arr;
    let str = `${Colours.FG_GRAY('Array')}${arr[0] !== undefined ? `${Colours.FG_GRAY('<')}${this._getValueColourFunction(arr[0] as Primitive, false)(typeof arr[0])}${Colours.FG_GRAY('>')}` : ''} ${Colours.FG_GRAY(`(${length} items)`)} [ `;

    if (length === 0) return `${str} ]`;

    if (length === 1 && typeof arr[0] !== 'object' && getObjectOrArrayLength(arr[0]) < 2) {
      return `${str}${this._colouriseValue(arr[0], depth + 1)} ]`;
    }

    str += '\n';
    for (const value of arr) str += `${this.getTabs(depth)}${this._colouriseValue(value, depth + 1)},\n`;
    return `${str + this.getTabs(depth - 1)}]`;
  }

  private static getTabs(depth: number): string {
    let str = '';
    for (let i = 0; i < depth; i++) str += '  ';
    return str;
  }
}

function getObjectOrArrayLength(obj: object | unknown[] | undefined): number {
  if (!obj) return 0;
  if (Array.isArray(obj)) return obj.length;
  return Object.keys(obj).length;
}
