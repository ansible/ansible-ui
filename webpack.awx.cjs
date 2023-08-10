const webpackConfig = require('./webpack.config');

const awxServer = process.env.AWX_SERVER ?? 'http://localhost:8043';
const proxyUrl = new URL(awxServer);

module.exports = function (_env, argv) {
  const config = webpackConfig(_env, argv);
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
