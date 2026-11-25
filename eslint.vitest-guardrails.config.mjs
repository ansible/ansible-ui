import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';
import i18next from 'eslint-plugin-i18next';
import reactEffectPlugin from 'eslint-plugin-react-you-might-not-need-an-effect';
import testingLibrary from 'eslint-plugin-testing-library';

export default [
  {
    ignores: ['**/node_modules/**', 'playwright/**'],
  },
  {
    // Test-only rules stay separate because eslint.guardrails.config.mjs excludes test files.
    files: [
      'frontend/**/*.{test,spec}.{ts,tsx}',
      'platform/**/*.{test,spec}.{ts,tsx}',
      'framework/**/*.{test,spec}.{ts,tsx}',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      vitest,
      'testing-library': testingLibrary,
      i18next,
      'react-you-might-not-need-an-effect': reactEffectPlugin,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      ...reactEffectPlugin.configs.recommended.rules,
      'i18next/no-literal-string': 'off',
      // Defer these until existing conditional assertions, helper assertions, and skipped tests are cleaned up.
      'vitest/no-conditional-expect': 'off',
      'vitest/no-disabled-tests': 'off',
      'vitest/no-standalone-expect': 'off',
      'vitest/expect-expect': [
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
      'vitest/no-identical-title': 'warn',
      'testing-library/no-debugging-utils': 'error',
      'testing-library/prefer-user-event': 'warn',
      'testing-library/no-node-access': 'warn',
    },
  },
];
