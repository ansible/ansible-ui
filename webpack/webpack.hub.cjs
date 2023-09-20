const webpackConfig = require('./webpack.config');

const HUB_SERVER =
  process.env.EDA_SERVER ||
  process.env.CYPRESS_HUB_SERVER ||
  (process.env.HUB_HOST & process.env.HUB_PROTOCOL
    ? `${process.env.HUB_PROTOCOL}://${process.env.HUB_HOST}`
    : 'http://localhost:8000');

const proxyUrl = new URL(HUB_SERVER);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/hub/Hub.tsx';

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
