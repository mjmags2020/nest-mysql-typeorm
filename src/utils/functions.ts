export function extractValuesFromParams<T extends object>(
  obj: any,
  keys: (keyof T)[],
): Partial<T> {
  const extractedValues: Partial<T> = {};

  keys.forEach((key) => {
    if (key in obj) {
      extractedValues[key] = obj[key];
    }
  });

  return extractedValues;
}
