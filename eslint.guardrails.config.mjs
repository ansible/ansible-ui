import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import i18next from 'eslint-plugin-i18next';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  {
    ignores: [
      '**/*.cjs',
      '**/publish/**',
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.test.*',
      '**/*.cy.*',
      '**/*.fixture.*',
      '**/generated/**',
      '**/*.config.*',
    ],
  },
  {
    files: ['frontend/**/*.{ts,tsx}', 'platform/**/*.{ts,tsx}', 'framework/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      i18next,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      'no-only-tests': noOnlyTests,
      prettier,
      react,
      'react-hooks': reactHooks,
      sonarjs,
    },
    rules: {
      'max-lines': ['warn', 500],
      'max-lines-per-function': ['warn', 200],
      complexity: ['warn', 20],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      'max-nested-callbacks': ['warn', 4],
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-nested-conditional': 'warn',
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXOpeningElement[name.name=/^h[1-6]$/]',
          message: 'Prefer the PatternFly Title component for headings.',
        },
        {
          selector: "JSXOpeningElement[name.name='p']",
          message: 'Prefer the PatternFly Content or HelperText component for text.',
        },
        {
          selector: "JSXOpeningElement[name.name='ul']",
          message: 'Prefer the PatternFly List component for unordered lists.',
        },
        {
          selector: "JSXOpeningElement[name.name='ol']",
          message: 'Prefer the PatternFly List component for ordered lists.',
        },
        {
          selector: "JSXOpeningElement[name.name='li']",
          message: 'Prefer the PatternFly List component for list items.',
        },
      ],
    },
  },
];
