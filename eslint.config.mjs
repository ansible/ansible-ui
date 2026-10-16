import eslint from '@eslint/js';
import i18next from 'eslint-plugin-i18next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const files = ['**/*.{js,mjs,cjs,jsx,mjsx,cjsx,ts,tsx,mtsx}'];

export default [
  {
    ignores: [
      '**/*.cjs',
      '**/publish/**',
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/eslint.config.mjs',
      '**/insights-tests/**',
      '**/insights/fec.config.js',
      '**/insights/monaco-languages.js',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  jsxA11y.flatConfigs.recommended,
  react.configs.flat.recommended,
  ...reactHooks.configs['flat/recommended'],
  i18next.configs['flat/recommended'],
  {
    files,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'no-only-tests': noOnlyTests,
      prettier,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      semi: ['error', 'always'],
      'prettier/prettier': 'error',
      'no-only-tests/no-only-tests': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'error',
      'jsx-a11y/no-autofocus': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: [
              'label',
              'placeholderText',
              'placeholder',
              'helperText',
              'description',
              'title',
              'subtitle',
              'errorStateTitle',
              'emptyStateTitle',
              'emptyStateDescription',
              'emptyStateButtonText',
            ],
          },
        },
      ],
      'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true } }],
      // Preserve the ESLint 8/typescript-eslint 7 lint policy while moving to
      // typescript-eslint 8. These rules changed their recommended behavior in
      // the interim migration and need a dedicated cleanup rather than broad
      // source suppressions.
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.tsx'],
    rules: {
      'i18next/no-literal-string': 'off',
    },
  },
  {
    files: ['frontend/**/*.ts', 'frontend/**/*.tsx', 'platform/**/*.ts', 'platform/**/*.tsx'],
    ignores: [
      '**/*.test.*',
      '**/*.cy.*',
      '**/*.fixture.*',
      '**/generated/**',
      '**/vite.config.*',
      '**/awx-utils.tsx',
      '**/eda-utils.tsx',
      '**/formatPath.tsx',
      '**/gateway-api-utils.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/\\x2Fapi\\x2Feda\\x2Fv1\\x2F?/]',
          message:
            "Don't hardcode '/api/eda/v1' paths. Use the edaAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'TemplateElement[value.raw=/\\x2Fapi\\x2Feda\\x2Fv1\\x2F?/]',
          message:
            "Don't hardcode '/api/eda/v1' paths. Use the edaAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'Literal[value=/\\x2Fapi\\x2Fgateway\\x2Fv1\\x2F?/]',
          message:
            "Don't hardcode '/api/gateway/v1' paths. Use the gatewayAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'TemplateElement[value.raw=/\\x2Fapi\\x2Fgateway\\x2Fv1\\x2F?/]',
          message:
            "Don't hardcode '/api/gateway/v1' paths. Use the gatewayAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'Literal[value=/\\x2Fapi\\x2Fcontroller\\x2Fv2\\x2F?/]',
          message:
            "Don't hardcode '/api/controller/v2' paths. Use the awxAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'TemplateElement[value.raw=/\\x2Fapi\\x2Fcontroller\\x2Fv2\\x2F?/]',
          message:
            "Don't hardcode '/api/controller/v2' paths. Use the awxAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'Literal[value=/\\x2Fapi\\x2Fgalaxy\\x2F?/]',
          message:
            "Don't hardcode '/api/galaxy' paths. Use the hubAPI`/path/` tagged template helper instead.",
        },
        {
          selector: 'TemplateElement[value.raw=/\\x2Fapi\\x2Fgalaxy\\x2F?/]',
          message:
            "Don't hardcode '/api/galaxy' paths. Use the hubAPI`/path/` tagged template helper instead.",
        },
      ],
    },
  },
];
