import { StartedPostgreSqlContainer } from 'testcontainers';

export default async function (jestConf) {
  if (!jestConf.watch && !jestConf.watchAll) {
    const container: StartedPostgreSqlContainer = global.__DB_TEST_CONTAINER__;
    await container.stop({ timeout: 10000, removeVolumes: true });
  }
}
