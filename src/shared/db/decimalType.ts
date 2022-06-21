import { Type } from '@mikro-orm/core';

export class DecimalType extends Type<number, string> {
  convertToJSValue(value): number | null {
    return typeof value === 'string' ? parseFloat(value) : value;
  }
}
