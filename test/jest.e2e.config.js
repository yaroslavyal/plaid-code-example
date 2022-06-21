const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  testRegex: '.*\\.e2e-spec\\.ts$',
  displayName: 'e2e',
  globalSetup: '<rootDir>/test/utils/globals/setup.ts',
  globalTeardown: '<rootDir>/test/utils/globals/teardown.ts',
};
