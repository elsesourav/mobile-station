const { loadEnv } = require('@medusajs/utils')
loadEnv('test', process.cwd())

module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true, decorators: true },
        },
      },
    ],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'tsx', 'jsx', 'json'],
  modulePathIgnorePatterns: ['dist/', '<rootDir>/.medusa/'],
  testMatch: ['**/src/**/__tests__/**/*.unit.spec.[jt]s'],
}
