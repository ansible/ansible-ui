const webpackConfig = require('./webpack.config');

const EDA_SERVER =
  process.env.EDA_SERVER ||
  process.env.CYPRESS_EDA_SERVER ||
  (process.env.EDA_HOST & process.env.EDA_PROTOCOL
    ? `${process.env.EDA_PROTOCOL}://${process.env.EDA_HOST}`
    : 'http://localhost:8000');

const proxyUrl = new URL(EDA_SERVER);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/eda/Eda.tsx';

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
