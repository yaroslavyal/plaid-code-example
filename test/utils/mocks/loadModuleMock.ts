import { ConfigModule } from '@nestjs/config';

const mock = jest.mock('../../../src/shared/utils/loadModule', () => {
  const originalModule = jest.requireActual(
    '../../../src/shared/utils/loadModule'
  );
  return {
    __esModule: true,
    ...originalModule,
    loadConfigModule: () => {
      return ConfigModule.forRoot({
        ignoreEnvFile: true,
        isGlobal: true,
        ignoreEnvVars: true,
        cache: true,
      });
    },
  };
});

export default mock;
