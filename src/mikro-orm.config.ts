import { LoadStrategy, Options } from '@mikro-orm/core';
import { IS_PROD } from './shared/constants';
import { Logger } from '@nestjs/common';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

const logger = new Logger('Mikro-ORM');

const config: MikroOrmModuleOptions & Options<PostgreSqlDriver> = {
  forceUtcTimezone: true,
  forceUndefined: true,
  type: 'postgresql',
  autoLoadEntities: true,
  debug: !IS_PROD,
  logger: logger.debug.bind(logger),
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  tsNode: process.env.MIKRO_ORM_CLI_USE_TS_NODE === 'true',
  loadStrategy: LoadStrategy.JOINED, // make it globally due to a bug https://github.com/mikro-orm/mikro-orm/issues/2803
  migrations: {
    path: './dist/migrations',
    pathTs: './migrations',
    disableForeignKeys: false,
  },
};

export default config;
