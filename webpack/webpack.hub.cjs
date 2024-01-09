const webpackConfig = require('./webpack.config');
const env = require('./environment.cjs');
const { HUB_SERVER } = env;
const proxyUrl = new URL(HUB_SERVER);
module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);
  config.entry = './frontend/hub/Hub.tsx';

  // publicPath is the path where the bundle is served from
  // https://webpack.js.org/guides/public-path/
  // it nees to match the route prefix of the app
  config.output.publicPath = process.env.PUBLIC_PATH || process.env.HUB_ROUTE_PREFIX || '/';

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
