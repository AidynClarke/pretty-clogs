import { getRandomWord } from './random-words';

const possibleElementNames = ['string', 'number', 'boolean'] as const;
type PossibleElementName = (typeof possibleElementNames)[number];

type PossibleElementType<T extends PossibleElementName = never> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : string | number | boolean;

type Func<T extends PossibleElementName> = () => PossibleElementType<T>;

const generatorMap: { [key in PossibleElementName]: Func<key> } = {
  string: getRandomWord,
  number: () => Math.floor(Math.random() * 10000),
  boolean: () => Math.random() > 0.5
};

function getRandomGenerator(): () => PossibleElementType<PossibleElementName> {
  const name = Object.keys(generatorMap)[Math.floor(Math.random() * Object.keys(generatorMap).length)] as keyof typeof generatorMap;
  return generatorMap[name];
}

export function generateRandomElement<T extends PossibleElementName = PossibleElementName>(type?: T): PossibleElementType<T> {
  if (type) {
    return generatorMap[type]();
  }

  return getRandomGenerator()() as PossibleElementType;
}

export function generateRandomElementArray<T extends PossibleElementName = PossibleElementName>(
  length: number,
  type?: T
): PossibleElementType<T>[] {
  const func = type ? generatorMap[type] : getRandomGenerator();
  const arr: PossibleElementType<T>[] = [];

  for (let i = 0; i < length; i++) arr.push(func() as PossibleElementType);

  return arr;
}
