import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  reporters: ['default'],
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    /** This dependency helps us mock css modules for Jest using an ES6 proxy.
     * Without this I found that jest fails to parse the backdrop.css file within
     * patternfly react-styles. */
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!ky|@patternfly/react-tokens)'],
};

export default config;
