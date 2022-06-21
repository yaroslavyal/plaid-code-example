import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyRawBody from 'fastify-raw-body';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { FastifyReply, FastifyRequest } from 'fastify';

export function initHttpAdapter(): FastifyAdapter {
  return new FastifyAdapter({
    trustProxy: true, // get ips behind proxy
    ignoreTrailingSlash: true,
  });
}

export async function registerAppHelpers({
  app,
  fastifyAdapter,
  includeSwagger = false,
}: {
  app: NestFastifyApplication;
  fastifyAdapter: FastifyAdapter;
  includeSwagger?: boolean;
}) {
  // get raw body
  await app.register(fastifyRawBody, {
    field: 'rawBody',
    encoding: 'utf8',
    runFirst: true,
    global: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  if (includeSwagger) {
    const documentConfig = new DocumentBuilder()
      .setTitle('Backend')
      .setDescription('Backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const fastifyInstance = fastifyAdapter.getInstance();
  const orm = app.get(MikroORM);

  fastifyInstance.addHook(
    'preHandler',
    (request: FastifyRequest, reply: FastifyReply, done) => {
      RequestContext.create(orm.em, done);
    }
  );
}
