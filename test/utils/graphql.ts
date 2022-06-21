import request = require('supertest');
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export function runGqlRequest({
  app,
  query,
  variables,
  authToken,
}: {
  app: NestFastifyApplication;
  query: string;
  variables?: Record<string, any>;
  authToken?: string;
}) {
  const superTest = request(app.getHttpServer())
    .post('/graphql')
    .send({ query, variables });

  if (authToken) {
    superTest.set('Authorization', `Bearer ${authToken}`);
  }

  return superTest;
}
