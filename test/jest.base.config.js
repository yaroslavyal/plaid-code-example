const path = require('path');
require('@swc/register');

process.env.MIKRO_ORM_CLI_USE_TS_NODE = 'true';

module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['jest-extended/all'],
  globals: {
    NODE_ENV: 'test',
  },
  rootDir: path.resolve(__dirname, '../'),
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.(t|j)s$': '@swc/jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '.json', '.snap'],
  moduleNameMapper: {
    '^~(.*)$': '<rootDir>/src/$1',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  testTimeout: 20000,
};
