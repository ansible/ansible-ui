import rootConfig from '../../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    ignores: ['fec.config.js', 'monaco-languages.js'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
];
