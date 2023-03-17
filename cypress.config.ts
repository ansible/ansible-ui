import codeCoverage from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';
import pkg from 'webpack';
import { Inventory, JobTemplate } from './frontend/awx/interfaces/generated-from-swagger/api';
import { Organization } from './frontend/awx/interfaces/Organization';
import { Project } from './frontend/awx/interfaces/Project';

const { DefinePlugin } = pkg;

export type Resources = {
  organization: Organization;
  inventory?: Inventory;
  project?: Project;
  jobTemplate?: JobTemplate;
  // We can expand this type to include EDA/hub resources
};

let globalResources: Resources | null;

export default defineConfig({
  viewportWidth: 1600,
  viewportHeight: 1120,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 30000,
  video: false,
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        setBaselineResources: (resources: Resources | null) => {
          globalResources = resources;
          return null;
        },
        getBaselineResources: (): Resources | null => {
          return globalResources ? globalResources : null;
        },
      });
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
        plugins: [
          new DefinePlugin({
            'process.env.AWX_ROUTE_PREFIX': JSON.stringify('/ui_next'),
            'process.env.HUB_ROUTE_PREFIX': JSON.stringify('/hub'),
            'process.env.EDA_ROUTE_PREFIX': JSON.stringify('/eda'),
          }),
        ],
      },
    },
    specPattern: 'frontend/**/*.cy.tsx',
    supportFile: 'cypress/support/component.ts',
  },
});
