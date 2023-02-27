import codeCoverage from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1600,
  viewportHeight: 1120,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 30000,

  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
      codeCoverage(on, config);
      return config;
    },
    baseUrl: 'https://localhost:3002/',
  },
  component: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
      codeCoverage(on, config);
      return config;
    },
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: {
        mode: 'development',
        devtool: false,
        resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
        module: {
          rules: [
            { test: /\.(hbs|yaml)$/, type: 'asset/source' },
            { test: /\.(svg)$/, use: '@svgr/webpack' },
            { test: /\.(jpg|jpeg|png|gif|ttf|eot|woff|woff2)$/, type: 'asset/resource' },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'],
            },
            {
              test: /\.(ts|tsx|js|jsx)$/,
              exclude: /node_modules/,
              use: [
                'coverage-istanbul-loader',
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: [
                      'istanbul',
                      ['@babel/plugin-transform-modules-commonjs', { loose: true }],
                    ],
                  },
                },
              ],
              type: 'javascript/auto',
            },
          ],
        },
      },
    },
    specPattern: 'frontend/awx/**/*.cy.tsx',
    supportFile: 'cypress/support/component.ts',
  },
});
