export function deepCopy<T extends object>(obj: T): T {
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

  for (const key of keys) {
    const value = obj[key];
    if (!value) {
      if (undefinedTo) newObj[key] = undefinedTo;
      continue;
    }
    if (typeof value === 'object') newObj[key] = deepCopy(value);
    else newObj[key] = value;
  }

  return newObj;
}
