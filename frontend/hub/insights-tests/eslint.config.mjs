import rootConfig from '../../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
];
