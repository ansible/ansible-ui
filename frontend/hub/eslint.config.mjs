import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ['insights-tests/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./insights-tests/tsconfig.json'],
      },
    },
  },
];
