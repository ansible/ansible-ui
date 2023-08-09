const webpackConfig = require('./webpack.config');

const hubServer = process.env.HUB_SERVER
  ? process.env.HUB_PROTOCOL + '://' + process.env.HUB_SERVER
  : 'http://localhost:5001';

const proxyUrl = new URL(hubServer);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);
  config.devServer.proxy = {
    '/api': {
      target: hubServer,
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
