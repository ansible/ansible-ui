/* eslint-disable @typescript-eslint/no-unused-vars */
import pkg from 'webpack';
import env from './webpack/environment.cjs';
const { DefinePlugin } = pkg;

export const baseConfig: Cypress.ConfigOptions = {
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 6,
  viewportWidth: 1600,
  viewportHeight: 1120,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 30000,
  video: false,
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser?.isHeadless) {
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gl-drawing-for-tests');
          launchOptions.args.push('--disable-gpu');
        }
        launchOptions.args.push('--js-flags=--max-old-space-size=3500');
        return launchOptions;
      });
      return config;
    },
    retries: { runMode: 2, openMode: 0 },
    env,
  },
  component: {
    setupNodeEvents(on, config) {
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
        optimization: {
          splitChunks: {
            cacheGroups: {
              vendors: {
                name: 'vendors',
                test: /[\\/]node_modules[\\/]/,
                chunks: 'all',
                enforce: true,
              },
            },
          },
        },
        plugins: [
          new DefinePlugin({
            'process.env.AWX_API_PREFIX': JSON.stringify(env.AWX_API_PREFIX),
            'process.env.AWX_WEBSOCKET_PREFIX': JSON.stringify(env.AWX_WEBSOCKET_PREFIX),
            'process.env.EDA_API_PREFIX': JSON.stringify(env.EDA_API_PREFIX),
            'process.env.HUB_API_PREFIX': JSON.stringify(env.HUB_API_PREFIX),
            'process.env.ROUTE_PREFIX': JSON.stringify(env.ROUTE_PREFIX),
          }),
        ],
        devServer: {
          port: 4200,
        },
      },
    },
    specPattern: ['**/*.cy.{js,jsx,ts,tsx}'],
    excludeSpecPattern: ['cypress/**/*.cy.{js,jsx,ts,tsx}'],
    supportFile: 'cypress/support/component.tsx',
  },
};
