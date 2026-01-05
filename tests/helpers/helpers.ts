import { generateRandomElement, generateRandomElementArray } from './random-element.js';
import { getRandomWord } from './random-words.js';

const objectTypeName = ['array', 'object'] as const;
export type ObjectTypeName = (typeof objectTypeName)[number];
export type ObjectType<T extends ObjectTypeName = never> = T extends 'array' ? unknown[] : T extends 'object' ? object : unknown[] | object;

function getObjectType(type?: ObjectTypeName): ObjectTypeName {
  if (type) return type;
  return objectTypeName[Math.floor(Math.random() * objectTypeName.length)] as ObjectTypeName;
}

export interface ElementRange {
  min: number;
  max: number;
}

export function generateTestObject(type: ObjectType, range: ElementRange, depth: number): ObjectType;
export function generateTestObject<T extends ObjectTypeName>(
  type: T,
  range: ElementRange,
  depth: number,
  only?: ObjectTypeName
): ObjectType<T>;
export function generateTestObject<T extends ObjectTypeName>(
  type: T,
  range: ElementRange,
  depth: number,
  only?: ObjectTypeName
): ObjectType<T> {
  const objGenerator = only ? getObjectType.bind(only) : getObjectType;
  return generateRandom(type, range, depth, 0, objGenerator);
}

function generateRandom(
  type: ObjectTypeName,
  range: ElementRange,
  desiredDepth: number,
  depth: number,
  getType: () => ObjectTypeName
): any {
  if (type === 'array') {
    return generateRandomArray(range, getType, desiredDepth, depth);
  }
  return generateRandomObject(range, getType, desiredDepth, depth);
}

function generateRandomObject(range: ElementRange, getType: () => ObjectTypeName, desiredDepth: number = 4, depth: number = 0): object {
  const obj: any = {};

  if (depth === desiredDepth) {
    for (let i = 0; i < generateNumberInRange(range); i++) {
      obj[getRandomWord()] = generateRandomElement();
    }
  } else {
    const type = getType();
    for (let i = 0; i < generateNumberInRange(range); i++) {
      obj[getRandomWord()] = generateRandom(type, range, desiredDepth, depth + 1, getType);
    }
  }

  return obj;
}

function generateRandomArray(
  range: ElementRange,
  getType: () => ObjectTypeName,
  desiredDepth: number = 4,
  depth: number = 0
): (string | number | boolean)[] | object[] {
  const elementNumber = generateNumberInRange(range);

  if (depth === desiredDepth) {
    return generateRandomElementArray(elementNumber);
  }

  const arr: any[] = [];
  const type = getType();

  for (let i = 0; i < elementNumber; i++) {
    arr.push(generateRandom(type, range, desiredDepth, depth + 1, getType));
  }

  return arr;
}

function generateNumberInRange(range: ElementRange): number {
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
}
