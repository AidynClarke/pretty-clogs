export function deepCopy<T extends object | unknown[]>(obj: T): T {
  if (Array.isArray(obj)) return copyArray(obj);
  return copyObject(obj);
}

function copyArray<T extends unknown[]>(arr: T): T {
  const newArr: any[] = [];

  for (const value of arr) {
    if (!value) continue;
    if (typeof value === 'object') {
      newArr.push(deepCopy(value));
    } else {
      newArr.push(value);
    }
  }

  return newArr as T;
}

function copyObject<T extends object>(obj: T): T {
  const keys = Object.keys(obj) as (keyof T)[];
  const newObj: any = {};

  for (const key of keys) {
    const value = obj[key];
    if (!value) continue;
    if (typeof value === 'object') newObj[key] = deepCopy(value);
    else newObj[key] = value;
  }

  return newObj;
}

export function filterObject<T extends object>(obj: T, keys: (keyof T)[], undefinedTo?: any): T {
  const newObj: any = {};

  const objKeys = Object.keys(obj) as (keyof T)[];

  for (const key of objKeys) {
    if (keys.includes(key)) newObj[key] = obj[key];
    else if (undefinedTo) newObj[key] = undefinedTo;
  }

  return newObj;
}
