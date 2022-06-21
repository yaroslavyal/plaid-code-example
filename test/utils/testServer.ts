import './mocks/loadModuleMock';
import './mocks/scheduleModuleMock';

import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder';
import { startJWKSAuthServer } from './mocks/authJWKSMock';
import { AuthConfig } from '../../src/auth/auth.config';
import { JWKSMock } from 'mock-jwks';
import {
  initHttpAdapter,
  registerAppHelpers,
} from '../../src/shared/utils/app';

export async function startTestServer({
  override,
}: {
  override?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
}): Promise<{ app: NestFastifyApplication; jwks: JWKSMock }> {
  const fastifyAdapter = initHttpAdapter();
  const builder: TestingModuleBuilder = await Test.createTestingModule({
    imports: [AppModule],
  });

  if (override) {
    override(builder);
  }

  const moduleFixture = await builder.compile();

  const app: NestFastifyApplication =
    moduleFixture.createNestApplication<NestFastifyApplication>(fastifyAdapter);
  await registerAppHelpers({ app, fastifyAdapter, includeSwagger: false });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const authConfig = app.get<AuthConfig>(AuthConfig);
  const jwks = startJWKSAuthServer(authConfig.authority);

  return { app, jwks };
}

export async function stopTestServer(
  app: NestFastifyApplication,
  jwks: JWKSMock
) {
  await app.close();
  await jwks.stop();
}
