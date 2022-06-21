const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  testRegex: '.*\\.spec\\.ts$',
};
