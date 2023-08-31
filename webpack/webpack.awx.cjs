const webpackConfig = require('./webpack.config');

const awxServer = process.env.AWX_HOST
  ? process.env.AWX_PROTOCOL + '://' + process.env.AWX_HOST
  : 'http://localhost:8043';

const proxyUrl = new URL(awxServer);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/awx/Awx.tsx';

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
    '/sso': {
      target: awxServer,
      secure: false,
      bypass: (req, res, options) => {
        // req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        // req.headers.referer = proxyUrl.href;
        req.headers.host = 'localhost:4101';
        req.referrer = 'https://localhost:4101/login';
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
