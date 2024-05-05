import { Colours, ColourKeys, Condition, getRandomColour } from './colour';

type LogTypes = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

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

  public static colouriseLogType(type: LogTypes): string {
    if (type === 'DEBUG') return Colours.FG_MAGENTA(type);
    if (type === 'INFO') return Colours.FG_BLUE_BRIGHT(type);
    if (type === 'WARN') return Colours.FG_YELLOW_BRIGHT(type);
    if (type === 'ERROR') return Colours.FG_RED_BRIGHT(type);
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
    if (typeof value === 'string') {
      if (value.toLowerCase().includes('invalid')) return Colours.FG_RED_BRIGHT(`${value}`);
      return Colours.FG_BLUE_BRIGHT(`'${value}'`);
    }
    if (typeof value === 'number') return Colours.FG_YELLOW_BRIGHT(value);
    if (typeof value === 'boolean') return Colours.FG_MAGENTA_BRIGHT(value.toString());
    if (value instanceof Date) return Colours.FG_GREEN_BRIGHT(value.toISOString());
    if (value instanceof Array) return this.colouriseArray(value, depth);
    if (value instanceof Object) return this.colouriseObject(value, depth);

    return `${value}`;
  }

  private static colouriseObject<T extends object | unknown[]>(obj: T, depth: number): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    if (entries.length === 1) return `{${Colours.BOLD(entries[0][0])}: ${this._colouriseValue(entries[0][1], depth + 1)}}`;

    let str = '{\n';

    for (const [key, value] of entries) {
      str += `${this.getTabs(depth)}${Colours.BOLD(key)}: ${this._colouriseValue(value, depth + 1)},\n`;
    }

    return `${str + this.getTabs(depth - 1)}}`;
  }

  private static colouriseArray<T extends unknown[]>(arr: T, depth: number) {
    const { length } = arr;
    let str = `(${length} items) [`;

    if (length === 0) return `${str}]`;

    if (length === 1) return `${str}${this._colouriseValue(arr[0], 1)},]`;

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
