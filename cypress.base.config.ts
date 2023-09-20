import codeCoverage from '@cypress/code-coverage/task';
import pkg from 'webpack';
const { DefinePlugin } = pkg;

const AWX_PROTOCOL = process.env.AWX_PROTOCOL || 'http';
const AWX_HOST = process.env.AWX_HOST || 'localhost:8043';
const AWX_SERVER =
  process.env.AWX_SERVER || process.env.CYPRESS_AWX_SERVER || `${AWX_PROTOCOL}://${AWX_HOST}`;
const AWX_USERNAME = process.env.AWX_USERNAME || process.env.CYPRESS_AWX_USERNAME || 'admin';
const AWX_PASSWORD = process.env.AWX_PASSWORD || process.env.CYPRESS_AWX_PASSWORD || 'password';
const AWX_API_PREFIX = process.env.AWX_API_PREFIX || '/api/v2';
const AWX_ROUTE_PREFIX = process.env.AWX_ROUTE_PREFIX || '/ui_next';

const EDA_PROTOCOL = process.env.EDA_PROTOCOL || 'http';
const EDA_HOST = process.env.EDA_HOST || 'localhost:5001';
const EDA_SERVER =
  process.env.EDA_SERVER || process.env.CYPRESS_EDA_SERVER || `${EDA_PROTOCOL}://${EDA_HOST}`;
const EDA_USERNAME = process.env.EDA_USERNAME || process.env.CYPRESS_EDA_USERNAME || 'admin';
const EDA_PASSWORD = process.env.EDA_PASSWORD || process.env.CYPRESS_EDA_PASSWORD || 'password';
const EDA_API_PREFIX = process.env.EDA_API_PREFIX || '/api/eda/v1';
const EDA_ROUTE_PREFIX = process.env.EDA_ROUTE_PREFIX || '/eda';

const HUB_PROTOCOL = process.env.HUB_PROTOCOL || 'http';
const HUB_HOST = process.env.HUB_HOST || 'localhost:8000';
const HUB_SERVER =
  process.env.HUB_SERVER || process.env.CYPRESS_HUB_SERVER || `${HUB_PROTOCOL}://${HUB_HOST}`;
const HUB_USERNAME = process.env.HUB_USERNAME || process.env.CYPRESS_HUB_USERNAME || 'admin';
const HUB_PASSWORD = process.env.HUB_PASSWORD || process.env.CYPRESS_HUB_PASSWORD || 'password';
const HUB_API_PREFIX =
  process.env.HUB_API_PREFIX || process.env.HUB_API_BASE_PATH || '/api/automation-hub/';
const HUB_ROUTE_PREFIX = process.env.HUB_ROUTE_PREFIX || '/hub';

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
    env: {
      AWX_SERVER,
      AWX_USERNAME,
      AWX_PASSWORD,
      AWX_API_PREFIX,
      AWX_ROUTE_PREFIX,

      EDA_SERVER,
      EDA_USERNAME,
      EDA_PASSWORD,
      EDA_API_PREFIX,
      EDA_ROUTE_PREFIX,

      HUB_SERVER,
      HUB_USERNAME,
      HUB_PASSWORD,
      HUB_API_PREFIX,
      HUB_ROUTE_PREFIX,
    },
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
            'process.env.AWX_ROUTE_PREFIX': JSON.stringify(AWX_ROUTE_PREFIX),
            'process.env.AWX_API_PREFIX': JSON.stringify(AWX_API_PREFIX),
            'process.env.EDA_ROUTE_PREFIX': JSON.stringify(EDA_ROUTE_PREFIX),
            'process.env.EDA_API_PREFIX': JSON.stringify(EDA_API_PREFIX),
            'process.env.HUB_ROUTE_PREFIX': JSON.stringify(HUB_ROUTE_PREFIX),
            'process.env.HUB_API_PREFIX': JSON.stringify(HUB_API_PREFIX),
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
