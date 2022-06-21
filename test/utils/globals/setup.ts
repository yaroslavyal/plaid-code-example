import { PostgreSqlContainer } from 'testcontainers';
import { MikroORM } from '@mikro-orm/core';
import config from '../../../src/mikro-orm.config';

let hasRun = false;

export default async function (jestConf) {
  // load container only once in watch mode
  if ((jestConf.watch || jestConf.watchAll) && hasRun) {
    return;
  }
  hasRun = true;

  const container = await new PostgreSqlContainer(
    // add the docker.io in the front to avoid short name image pull error
    'docker.io/postgres:13-alpine'
  ).start();
  process.env.MIKRO_ORM_PORT = container.getPort().toString();
  process.env.MIKRO_ORM_HOST = container.getHost();
  process.env.MIKRO_ORM_DB_NAME = container.getDatabase();
  process.env.MIKRO_ORM_USER = container.getUsername();
  process.env.MIKRO_ORM_PASSWORD = container.getPassword();
  process.env.MIKRO_ORM_ENV = '.env.test'; // to avoid loading of local .env file

  // eslint-disable-next-line no-console
  console.log('Start migrations');
  const orm = await MikroORM.init({
    ...config,
    debug: false,
  });
  const migrator = orm.getMigrator();
  await migrator.up();
  await orm.close();
  // eslint-disable-next-line no-console
  console.log('End migrations');
  global.__DB_TEST_CONTAINER__ = container;
}
