/**
 * Webpack configuration for Hub Insights/CRC build
 *
 * This is an ISOLATED build environment - dependencies are managed separately
 * from the main aap-ui monorepo to avoid polluting the root package-lock.json.
 *
 * Setup:
 *   cd frontend/hub/insights
 *   npm install
 *   npm run serve    # Start dev server on port 8002
 *   npm run build    # Production build
 */
const { resolve } = require('node:path');
const config = require('@redhat-cloud-services/frontend-components-config');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');

const isBuild = process.env.NODE_ENV === 'production';
const cloudBeta = process.env.HUB_CLOUD_BETA; // "true" | "false" | undefined (=default)
const isCloudDev = !!process.env.CLOUDOT_ENV;

// Plugin to handle Vite-style ?inline imports by stripping the query
class StripQueryPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('StripQueryPlugin', (nmf) => {
      nmf.hooks.beforeResolve.tap('StripQueryPlugin', (resolveData) => {
        if (resolveData.request && resolveData.request.includes('?inline')) {
          resolveData.request = resolveData.request.replace('?inline', '');
        }
      });
    });
  }
}

// Default user defined settings
const defaultConfigs = [
  // Global scope means that the variable will be available to the app itself
  // as a constant after it is compiled
  { name: 'API_BASE_PATH', default: '/api/automation-hub/', scope: 'global' },
  { name: 'APPLICATION_NAME', default: 'Automation Hub', scope: 'global' },
  { name: 'IS_INSIGHTS', default: true, scope: 'global' },
  { name: 'UI_BASE_PATH', default: '/ansible/automation-hub/', scope: 'global' },

  // Webpack scope: only available in customConfigs here, not exposed to the UI
  { name: 'UI_DEBUG', default: false, scope: 'webpack' },
  { name: 'UI_PORT', default: 8002, scope: 'webpack' },
  { name: 'UI_USE_HTTPS', default: false, scope: 'webpack' },
];

const customConfigs = {};
const globals = {};

defaultConfigs.forEach((item) => {
  customConfigs[item.name] = item.default;
});

defaultConfigs
  .filter(({ scope }) => scope === 'global')
  .forEach((item) => {
    globals[item.name] = JSON.stringify(customConfigs[item.name]);
  });

// Add additional globals needed by Hub
globals.HUB_API_PREFIX = JSON.stringify(process.env.HUB_API_PREFIX || '/api/automation-hub');
globals.ROUTE_PREFIX = JSON.stringify(process.env.ROUTE_PREFIX || '/ansible/automation-hub');
globals.HUB_SERVER = JSON.stringify(process.env.HUB_SERVER || '');
globals.DISCLAIMER = JSON.stringify(process.env.DISCLAIMER || 'false');
globals.PRODUCT = JSON.stringify(process.env.PRODUCT || 'Automation Hub');
globals.VERSION = JSON.stringify(process.env.VERSION || '');

// Paths relative to this insights/ directory
const rootFolder = resolve(__dirname);
const hubFolder = resolve(__dirname, '..');
const repoRoot = resolve(__dirname, '../../..');
const appEntry = resolve(__dirname, 'HubRoot.tsx');

const { config: webpackConfig, plugins } = config({
  appEntry,
  rootFolder,
  definePlugin: globals,
  debug: customConfigs.UI_DEBUG,
  https: isCloudDev || customConfigs.UI_USE_HTTPS,
  port: isCloudDev ? 1337 : customConfigs.UI_PORT,

  // Don't bundle PatternFly - Chrome shell provides it
  bundlePfModules: false,

  // Ensure hashed filenames
  useFileHash: true,

  // Insights production deployment
  deployment: cloudBeta === 'true' ? 'beta/apps' : 'apps',

  // Proxy mode: when CLOUDOT_ENV is set (via fec dev --clouddotEnv), enable the
  // CRC proxy so the local dev server routes API and Chrome requests to the
  // specified environment (stage/prod).
  ...(isCloudDev
    ? {
        useProxy: true,
        env: `${process.env.CLOUDOT_ENV}-stable`,
        appUrl: ['/ansible/automation-hub/', '/ansible/automation-hub'],
        routes: {
          '/apps/chrome': {
            target: `http://${process.env.FEC_CHROME_HOST}:${process.env.FEC_CHROME_PORT}`,
          },
        },
      }
    : {}),
});

// Override sections of the webpack config to work with TypeScript
// Following ansible-hub-ui pattern
const newWebpackConfig = {
  ...webpackConfig,

  // Source maps for debugging
  devtool: 'source-map',

  module: {
    ...webpackConfig.module,

    // Override to use babel-loader like ansible-hub-ui
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          { loader: 'source-map-loader' },
          {
            loader: 'babel-loader',
            options: {
              configFile: resolve(repoRoot, 'babel.config.json'),
            },
          },
        ],
      },
      {
        test: /\.(css|scss|sass)$/,
        use: [isBuild ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|jpg|png|eot|gif)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: { filename: 'fonts/[name][ext][query]' },
      },
      {
        test: /\.svg$/,
        resourceQuery: /react/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.svg$/,
        resourceQuery: { not: [/react/] },
        type: 'asset/resource',
        generator: { filename: 'fonts/[name][ext][query]' },
      },
    ],
  },

  resolve: {
    ...webpackConfig.resolve,

    // Support jsx, tsx
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],

    alias: {
      ...webpackConfig.resolve?.alias,

      // Workspace package aliases - point to actual source in parent directories
      '@ansible/ansible-ui-framework': resolve(repoRoot, 'framework'),
      '@ansible/common-ui': resolve(repoRoot, 'frontend/common'),
      '@ansible/hub-ui': hubFolder,

      // Stub AWX for standalone Hub (only AwxRoute is imported)
      '@ansible/awx-ui': resolve(__dirname, 'awx-stub.ts'),
    },
  },

  output: {
    ...webpackConfig.output,
    path: resolve(hubFolder, 'dist-insights'),
    publicPath: '/apps/automation-hub/',
    clean: true,
  },

  watchOptions: {
    // ignore editor files when watching
    ignored: ['**/.*.sw[po]'],
  },
};

// Filter out ForkTsCheckerWebpackPlugin - type checking is done separately via `npm run tsc`
const filteredPlugins = plugins.filter(
  (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
);

// StripQueryPlugin: handle Vite-style ?inline imports
// federatedModules: Module Federation + fed-mods.json manifest for Chrome/scalprum
//   Uses same approach as ansible-hub-ui: FEC's federatedModules wrapper around DynamicRemotePlugin.
//   Since insights/package.json has no runtime dependencies (monorepo), shared deps are explicit.
filteredPlugins.push(
  new StripQueryPlugin(),
  require('@redhat-cloud-services/frontend-components-config-utilities/federated-modules')({
    root: rootFolder,
    exposes: {
      './RootApp': appEntry,
    },
    shared: [
      { 'react-router-dom': { singleton: true, eager: false, import: false, version: '*' } },
      { react: { singleton: true, eager: false, import: false, version: '*' } },
      { 'react-dom': { singleton: true, eager: false, import: false, version: '*' } },
      { '@scalprum/react-core': { singleton: true, eager: false, import: false, version: '*' } },
      { '@scalprum/core': { singleton: true, eager: false, import: false, version: '*' } },
    ],
  })
);

// Stub out AWX imports - Hub is standalone on CRC (only AwxRoute is imported)
const awxStub = resolve(__dirname, 'awx-stub.ts');

// Add remaining plugins in a single push call:
// - Monaco editor for YAML support
// - AWX stub replacement
// - process.env definitions
// - Suppress "Critical dependency" warning from @rhds/elements
filteredPlugins.push(
  new MonacoWebpackPlugin({
    // Include all languages used by Hub forms:
    // - yaml: for YAML editors (variables, etc.)
    // - json: for JSON editors
    // - markdown: for PageFormMarkdown (used in namespace forms)
    languages: ['yaml', 'json', 'markdown'],
    // Configure monaco-yaml worker (must match main webpack config)
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
  new webpack.NormalModuleReplacementPlugin(/@ansible\/awx-ui/, awxStub),
  new webpack.DefinePlugin({
    'process.env.IS_INSIGHTS': JSON.stringify(true),
    'process.env.HUB_API_PREFIX': JSON.stringify(
      process.env.HUB_API_PREFIX || '/api/automation-hub'
    ),
    'process.env.UI_BASE_PATH': JSON.stringify(
      process.env.UI_BASE_PATH || '/ansible/automation-hub/'
    ),
    'process.env.ROUTE_PREFIX': JSON.stringify(
      process.env.ROUTE_PREFIX || '/ansible/automation-hub'
    ),
    'process.env.HUB_SERVER': JSON.stringify(process.env.HUB_SERVER || ''),
    'process.env.DISCLAIMER': JSON.stringify(process.env.DISCLAIMER || 'false'),
    'process.env.PRODUCT': JSON.stringify(process.env.PRODUCT || 'Automation Hub'),
    'process.env.VERSION': JSON.stringify(process.env.VERSION || ''),
  }),
  new webpack.ContextReplacementPlugin(/@rhds\/elements/, (data) => {
    delete data.dependencies[0].critical;
    return data;
  }),
  new CopyPlugin({
    patterns: [{ from: resolve(repoRoot, 'locales'), to: 'locales' }],
  })
);

module.exports = {
  ...newWebpackConfig,
  plugins: filteredPlugins,
};
