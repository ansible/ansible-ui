const react_refresh_webpack_plugin = require('@pmmmwh/react-refresh-webpack-plugin')
const css_minimizer_webpack_plugin = require('css-minimizer-webpack-plugin')
const html_webpack_plugin = require('html-webpack-plugin')
const mini_css_extract_plugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = function (_env, argv) {
    var isProduction = argv.mode === 'production' || argv.mode === undefined
    var isDevelopment = !isProduction
    var config = {
        entry: './frontend',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        module: {
            rules: [
                { test: /\.(hbs|yaml)$/, type: 'asset/source' },
                { test: /\.(svg)$/, use: '@svgr/webpack' },
                { test: /\.(jpg|jpeg|png|gif|ttf|eot|woff|woff2)$/, type: 'asset/resource' },
                {
                    test: /\.css$/,
                    use: isDevelopment ? ['style-loader', 'css-loader'] : [mini_css_extract_plugin.loader, 'css-loader'],
                },
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    loader: require.resolve('babel-loader'),
                    options: {
                        plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
                    },
                    type: 'javascript/auto',
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': isProduction ? JSON.stringify('production') : JSON.stringify('development'),
            }),
            isDevelopment && new react_refresh_webpack_plugin(),
            new html_webpack_plugin({ title: 'Ansible', favicon: 'frontend/icons/favicon.png' }),
            new mini_css_extract_plugin({
                filename: '[contenthash].css',
                chunkFilename: '[id].[contenthash:8].css',
                ignoreOrder: false,
            }),
        ].filter(Boolean),
        output: {
            clean: true,
            filename: isProduction ? '[contenthash].js' : undefined,
            path: path.resolve(__dirname, 'build/public'),
            publicPath: isProduction ? '/' : '/',
        },
        optimization: {
            minimizer: [
                '...',
                new css_minimizer_webpack_plugin({
                    minimizerOptions: {
                        preset: ['default', { mergeLonghand: false }],
                    },
                }),
            ],
        },
        devServer: {
            static: 'ansible',
            port: 3002,
            open: true,
            historyApiFallback: true,
            compress: true,
            hot: true,
            server: 'https',
            proxy: {
                '/api': {
                    target: 'https://localhost:3001',
                    secure: false,
                },
            },
        },
        devtool: isDevelopment && 'source-map',
    }
    return config
}
