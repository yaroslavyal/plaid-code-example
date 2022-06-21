import { TestingModule } from '@nestjs/testing';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export function groupModuleGet<R extends Record<string, any>, T = any>({
  module,
  requestedInstance,
}: {
  module: TestingModule | NestFastifyApplication;
  requestedInstance: T;
}): R {
  const entries: [keyof R, any][] = Object.entries(requestedInstance);
  return entries.reduce((accObj, [key, type]) => {
    accObj[key] = module.get(type);
    return accObj;
  }, {} as R);
}
