const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

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
            isDevelopment && 'coverage-istanbul-loader',
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
        'process.env.AWX': env.awx ? JSON.stringify('true') : JSON.stringify(''),
        'process.env.HUB': env.hub ? JSON.stringify('true') : JSON.stringify(''),
        'process.env.EDA': env.eda ? JSON.stringify('true') : JSON.stringify(''),
        'process.env.AWX_ROUTE_PREFIX': env.awx_route_prefix
          ? JSON.stringify(env.awx_route_prefix)
          : JSON.stringify('/ui_next'),
        'process.env.HUB_ROUTE_PREFIX': env.hub_route_prefix
          ? JSON.stringify(env.hub_route_prefix)
          : JSON.stringify('/hub'),
        'process.env.EDA_ROUTE_PREFIX': env.eda_route_prefix
          ? JSON.stringify(env.eda_route_prefix)
          : JSON.stringify('/eda'),
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
      ...['en', 'fr'].map((locale) => {
        return new MergeJsonWebpackPlugin({
          files: [`./locales/${locale}/translation.json`],
          output: {
            fileName: `/locales/${locale}/translation.json`,
          },
          space: 4,
        });
      }),
      new HtmlWebpackPlugin({
        title: 'AnsibleDev',
        template: 'frontend/index.html',
      }),
      new MiniCssExtractPlugin({
        filename: '[contenthash].css',
        chunkFilename: '[id].[contenthash:8].css',
        ignoreOrder: false,
      }),
      env.pwa && new GenerateSW({ clientsClaim: true, skipWaiting: true }),
      new CopyPlugin({
        patterns: [
          { from: 'frontend/icons', to: 'static/media' },
          { from: 'frontend/manifest.webmanifest' },
        ],
      }),
      new MonacoWebpackPlugin({
        languages: ['json', 'yaml', 'shell'],
      }),
    ].filter(Boolean),
    output: {
      clean: true,
      filename: isProduction ? '[contenthash].js' : undefined,
      path: path.resolve(__dirname, 'build/public'),
      publicPath: isProduction && env.awx ? '/static/awx/' : '/',
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
      static: 'ansible',
      port: 3002,
      historyApiFallback: true,
      compress: true,
      hot: true,
      server: 'https',
      proxy: {
        '/api': {
          target: 'https://localhost:3001',
          secure: false,
        },
        '/websocket/': {
          target: 'https://localhost:3001',
          secure: false,
          ws: true,
        },
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
  return config;
};
