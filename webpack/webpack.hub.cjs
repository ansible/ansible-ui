const webpackConfig = require('./webpack.config');
const env = require('./environment.cjs');
const proxyUrl = new URL(env.HUB_SERVER);
module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/hub/Hub.tsx';

  config.devServer.proxy = {
    '/api': {
      target: env.HUB_SERVER,
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
