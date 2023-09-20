import codeCoverage from '@cypress/code-coverage/task';
import pkg from 'webpack';
import env from './webpack/environment.cjs';
const { DefinePlugin } = pkg;

export const baseConfig: Cypress.ConfigOptions = {
  viewportWidth: 1600,
  viewportHeight: 1120,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 30000,
  video: false,
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
      codeCoverage(on, config);
      return config;
    },
    retries: { runMode: 2, openMode: 0 },
    env,
  },
  component: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
      codeCoverage(on, config);
      return config;
    },
    retries: { runMode: 2, openMode: 0 },
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
        plugins: [
          new DefinePlugin({
            'process.env.AWX_ROUTE_PREFIX': JSON.stringify(env.AWX_ROUTE_PREFIX),
            'process.env.AWX_API_PREFIX': JSON.stringify(env.AWX_API_PREFIX),
            'process.env.EDA_ROUTE_PREFIX': JSON.stringify(env.EDA_ROUTE_PREFIX),
            'process.env.EDA_API_PREFIX': JSON.stringify(env.EDA_API_PREFIX),
            'process.env.HUB_ROUTE_PREFIX': JSON.stringify(env.HUB_ROUTE_PREFIX),
            'process.env.HUB_API_PREFIX': JSON.stringify(env.HUB_API_PREFIX),
          }),
        ],
        devServer: {
          port: 4200,
        },
      },
    },
    specPattern: ['frontend/**/*.cy.tsx', 'framework/**/*.cy.tsx'],
    supportFile: 'cypress/support/component.tsx',
  },
};
