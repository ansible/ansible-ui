const webpackConfig = require('./webpack.config');

const awxServer = process.env.AWX_SERVER
  ? process.env.AWX_PROTOCOL + '://' + process.env.AWX_SERVER
  : 'http://localhost:8043';

const proxyUrl = new URL(awxServer);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);
  config.devServer.proxy = {
    '/api': {
      target: awxServer,
      secure: false,
      bypass: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
    '/websocket': {
      target: awxServer,
      ws: true,
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
