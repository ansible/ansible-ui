const webpackConfig = require('../webpack/webpack.config');

const PLATFORM_SERVER = process.env.PLATFORM_SERVER || 'https://localhost:9080';

const proxyUrl = new URL(PLATFORM_SERVER);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './platform/Platform.tsx';

  config.devServer.proxy = {
    '/api': {
      target: PLATFORM_SERVER,
      secure: false,
      bypass: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
    '/sso': {
      target: PLATFORM_SERVER,
      secure: false,
      bypass: (req, res, options) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
    '/websocket': {
      target: PLATFORM_SERVER,
      secure: false,
      ws: true,
      changeOrigin: true,
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
