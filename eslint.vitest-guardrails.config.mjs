import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import i18next from 'eslint-plugin-i18next';
import testingLibrary from 'eslint-plugin-testing-library';

export default [
  {
    ignores: ['**/node_modules/**', 'playwright/**'],
  },
  {
    files: [
      'frontend/**/*.{test,spec}.{ts,tsx}',
      'platform/**/*.{test,spec}.{ts,tsx}',
      'framework/**/*.{test,spec}.{ts,tsx}',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@vitest': vitest,
      'testing-library': testingLibrary,
      i18next,
    },
    rules: {
      'i18next/no-literal-string': 'off',
      '@vitest/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expect',
            'expectResults',
            'expectBreadcrumbs',
            'expectAboutDialogAbsent',
          ],
        },
      ],
      '@vitest/no-identical-title': 'warn',
      'testing-library/no-debugging-utils': 'warn',
      'testing-library/prefer-user-event': 'warn',
      'testing-library/no-node-access': 'warn',
    },
  },
];
