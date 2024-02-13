const webpackConfig = require('./webpack.config');
const env = require('./environment.cjs');
const { EDA_SERVER } = env;
const proxyUrl = new URL(EDA_SERVER);
module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);
  config.entry = './frontend/eda/main/Eda.tsx';

  // publicPath is the path where the bundle is served from
  // https://webpack.js.org/guides/public-path/
  config.output.publicPath = process.env.PUBLIC_PATH || process.env.ROUTE_PREFIX || '/';

  config.devServer.proxy = {
    '/api': {
      target: EDA_SERVER,
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
