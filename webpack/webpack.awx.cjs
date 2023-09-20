const webpackConfig = require('./webpack.config');
const { AWX_SERVER } = require('./environment.cjs');
const proxyUrl = new URL(AWX_SERVER);
module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/awx/Awx.tsx';

  config.devServer.proxy = {
    '/api': {
      target: AWX_SERVER,
      secure: false,
      bypass: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
    '/sso': {
      target: AWX_SERVER,
      secure: false,
      bypass: (req, res, options) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
    '/websocket': {
      target: AWX_SERVER,
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
