const webpackConfig = require('../webpack/webpack.config');

const platformServer = process.env.PLATFORM_HOST
  ? process.env.PLATFORM_PROTOCOL + '://' + process.env.PLATFORM_HOST
  : 'https://localhost:8000';

const proxyUrl = new URL(platformServer);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './platform/Platform.tsx';

  config.devServer.proxy = {
    '/api': {
      target: platformServer,
      secure: false,
      bypass: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
    '/sso': {
      target: platformServer,
      secure: false,
      bypass: (req, res, options) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
    '/websocket': {
      target: platformServer,
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

function getRawHeader(rawHeaders, headerName) {
  const index = rawHeaders.indexOf(headerName);
  if (index === -1) {
    return null;
  }
  return rawHeaders[index + 1];
}
