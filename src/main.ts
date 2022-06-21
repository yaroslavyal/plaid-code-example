import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { IS_PROD } from './shared/constants';
import { initHttpAdapter, registerAppHelpers } from './shared/utils/app';

global['fetch'] = require('node-fetch');

async function bootstrap() {
  const fastifyAdapter = initHttpAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: IS_PROD ? ['warn', 'error'] : ['debug'],
    }
  );

  await registerAppHelpers({ app, fastifyAdapter, includeSwagger: true });

  await app.listen(3000);
}
bootstrap();
