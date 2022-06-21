import { pick } from 'lodash';

export type PropertySerializer<
  T extends Record<string, any>,
  K extends keyof T
> = Partial<Record<K, (value: T[K] & any) => string>>;

export function getStringifiedEntries<
  T extends Record<string, any>,
  K extends keyof T
>(obj: T, propertySerializer?: PropertySerializer<T, K>): string {
  const entries = Object.entries(obj).sort();
  return JSON.stringify(
    propertySerializer
      ? entries.map(([key, val]) => [
          key,
          propertySerializer[key] ? propertySerializer[key](val) : val,
        ])
      : entries
  );
}

export function createMappedPropertySet<
  T extends Record<string, any>,
  K extends keyof T
>(
  array: T[],
  propertyList: K[],
  propertySerializer?: PropertySerializer<T, K>
) {
  return array.reduce<Record<string, T>>(
    (accuObj, element) => ({
      ...accuObj,
      [getStringifiedEntries(pick(element, propertyList), propertySerializer)]:
        element,
    }),
    {}
  );
}
