const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const webpackConfig = require('./webpack.config');
const env = require('./environment.cjs');
const { HUB_SERVER } = env;
const proxyUrl = new URL(HUB_SERVER);
module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/hub/main/Hub.tsx';

  // publicPath is the path where the bundle is served from
  // https://webpack.js.org/guides/public-path/
  config.output.publicPath = process.env.PUBLIC_PATH || process.env.ROUTE_PREFIX || '/';

  // FavIcons
  config.plugins.unshift(
    new FaviconsWebpackPlugin({
      logo: './frontend/assets/galaxy-icon.svg',
      inject: true,
    })
  );

  config.devServer.proxy = {
    '/api': {
      target: HUB_SERVER,
      secure: false,
      bypass: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
  };
  return config;
};
