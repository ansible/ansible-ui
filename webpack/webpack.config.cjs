const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');

switch (process.env.UI_MODE) {
  case 'AWX':
  case 'HUB':
  case 'EDA':
    break;
  case '':
  case undefined:
    console.error('UI_MODE is not set');
    exit(1);
    break;
  default:
    console.error('UI_MODE is not valid');
    exit(1);
    break;
}

if (!process.env.PRODUCT) {
  switch (process.env.UI_MODE) {
    case 'AWX':
      process.env.PRODUCT = 'Automation Controller';
      break;
    case 'HUB':
      process.env.PRODUCT = 'Automation Hub';
      break;
    case 'EDA':
      process.env.PRODUCT = 'Event Driven Automation';
      break;
  }
}

module.exports = function (env, argv) {
  var isProduction = argv.mode === 'production' || argv.mode === undefined;
  var isDevelopment = !isProduction;
  var config = {
    entry: './frontend',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      fallback: {
        fs: require.resolve('browserify-fs'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        util: require.resolve('node-util'),
        module: require.resolve('node-util'),
        stream: require.resolve('stream-browserify'),
        module: false,
      },
    },
    module: {
      rules: [
        { test: /\.(hbs|yaml)$/, type: 'asset/source' },
        { test: /\.(svg)$/, use: '@svgr/webpack' },
        { test: /\.(jpg|jpeg|png|gif|ttf|eot|woff|woff2)$/, type: 'asset/resource' },
        {
          test: /\.css$/,
          use: isDevelopment
            ? ['style-loader', 'css-loader']
            : [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
              },
            },
          ].filter(Boolean),
          type: 'javascript/auto',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': isProduction
          ? JSON.stringify('production')
          : JSON.stringify('development'),
        'process.env.BRAND': JSON.stringify(process.env.BRAND),
        'process.env.PRODUCT': JSON.stringify(process.env.PRODUCT),
        'process.env.DISCLAIMER': JSON.stringify(process.env.DISCLAIMER),
        'process.env.VERSION': isProduction
          ? JSON.stringify(process.env.VERSION)
          : JSON.stringify('development'),
        'process.env.DELAY': isProduction
          ? JSON.stringify('')
          : JSON.stringify(process.env.DELAY ?? ''),
        'process.env.PWA': env.pwa ? JSON.stringify('true') : JSON.stringify(''),
        'process.env.UI_MODE': JSON.stringify(process.env.UI_MODE),
        'process.env.AWX_ROUTE_PREFIX': env.awx_route_prefix
          ? JSON.stringify(env.awx_route_prefix)
          : JSON.stringify('/ui_next'),
        'process.env.HUB_ROUTE_PREFIX': env.hub_route_prefix
          ? JSON.stringify(env.hub_route_prefix)
          : JSON.stringify('/hub'),
        'process.env.EDA_ROUTE_PREFIX': env.eda_route_prefix
          ? JSON.stringify(env.eda_route_prefix)
          : JSON.stringify('/eda'),
        'process.env.HUB_API_BASE_PATH': JSON.stringify(env.hub_api_base_path || ''),
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
      ...['en', 'es', 'fr', 'ja', 'ko', 'nl', 'zh', 'zu'].map((locale) => {
        return new MergeJsonWebpackPlugin({
          files: [`./locales/${locale}/translation.json`],
          output: {
            fileName: `/locales/${locale}/translation.json`,
          },
          space: 4,
        });
      }),
      new HtmlWebpackPlugin({ title: process.env.PRODUCT }),
      new MiniCssExtractPlugin({
        filename: '[contenthash].css',
        chunkFilename: '[id].[contenthash:8].css',
        ignoreOrder: false,
      }),
      new CopyPlugin({
        patterns: [{ from: 'frontend/icons', to: 'static/media' }],
      }),
      new MonacoWebpackPlugin({
        languages: ['json', 'yaml', 'shell'],
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
      new CompressionPlugin(),
    ].filter(Boolean),
    output: {
      clean: true,
      filename: isProduction ? '[contenthash].js' : undefined,
      path: path.resolve(__dirname, '../build/public'),
      publicPath: process.env.PUBLIC_PATH || '/',
    },
    optimization: {
      minimizer: [
        '...',
        new CssMinimizerWebpackPlugin({
          minimizerOptions: {
            preset: ['default', { mergeLonghand: false }],
          },
        }),
      ],
    },
    devServer: {
      historyApiFallback: true,
      compress: true,
      hot: true,
      devMiddleware: { writeToDisk: true },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    watchOptions: {
      // ignore editor files when watching
      ignored: ['**/.*.sw[po]'],
    },
  };
  return config;
};
