/* eslint-disable @typescript-eslint/no-unused-vars */
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import pkg from 'webpack';
import env from './webpack/environment.cjs';
import cypressSplit from 'cypress-split';
import { unlinkSync, existsSync } from 'fs';
const { DefinePlugin } = pkg;

export const baseConfig: Cypress.ConfigOptions = {
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 1,
  viewportWidth: 1600,
  viewportHeight: 1120,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 30000,
  video: false,
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      // Create inline multi-handler support to allow both video deletion and cypress-split
      // to register after:spec handlers (Cypress bug #22428 only allows one handler per event)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handlers = new Map<string, Array<(...args: any[]) => any>>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const multiHandlerOn = ((event: string, handler: (...args: any[]) => any) => {
        if (!handlers.has(event)) {
          handlers.set(event, []);
          // Register a single handler with Cypress that calls all stored handlers
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
          on(event as any, async (...args: any[]) => {
            const eventHandlers = handlers.get(event) || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let lastResult: any;
            for (const h of eventHandlers) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
              const result = h(...args);
              if (result instanceof Promise) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                lastResult = await result;
              } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                lastResult = result;
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return lastResult;
          });
        }
        handlers.get(event)!.push(handler);
      }) as typeof on;

      multiHandlerOn('before:browser:launch', (browser, launchOptions) => {
        if (browser?.name === 'chrome') {
          if (browser?.isHeadless) {
            launchOptions.args.push('--no-sandbox');
            launchOptions.args.push('--disable-gl-drawing-for-tests');
            launchOptions.args.push('--disable-gpu');
          }
          launchOptions.args.push('--js-flags=--max-old-space-size=4096');
          launchOptions.args.push('--disable-renderer-backgrounding');
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--force-device-scale-factor=1');
        }
        return launchOptions;
      });

      multiHandlerOn('after:spec', (_spec, results) => {
        if (results?.video) {
          // Check if all tests ultimately passed (checking final attempt state)
          const hasFailures = results.tests?.some((test) =>
            test.attempts?.some((attempt) => attempt.state === 'failed')
          );

          if (!hasFailures && existsSync(results.video)) {
            unlinkSync(results.video);
          }
        }
      });

      return cypressSplit(multiHandlerOn, config);
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
          new MonacoWebpackPlugin({
            languages: ['yaml', 'json', 'markdown'],
            customLanguages: [
              {
                label: 'yaml',
                entry: 'monaco-yaml',
                worker: {
                  id: 'monaco-yaml/yamlWorker',
                  entry: 'monaco-yaml/yaml.worker',
                },
              },
            ],
          }),
          new DefinePlugin({
            'process.env.E2E_MODE': JSON.stringify(env.E2E_MODE),
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
