const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  testRegex: '.int-spec.ts$',
  globalSetup: '<rootDir>/test/utils/globals/setup.ts',
  globalTeardown: '<rootDir>/test/utils/globals/teardown.ts',
};
