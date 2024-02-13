const webpackConfig = require('../webpack/webpack.config');
const webpack = require('webpack');

const GATEWAY_API_PREFIX = process.env.GATEWAY_API_PREFIX || '/api/gateway/v1';

const PLATFORM_SERVER = process.env.PLATFORM_SERVER || 'https://localhost:443';

const proxyUrl = new URL(PLATFORM_SERVER);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './platform/main/Platform.tsx';

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
      bypass: (req) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
    '/api/controller/websocket': {
      target: PLATFORM_SERVER,
      secure: false,
      ws: true,
      bypass: (req) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
  };

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.GATEWAY_API_PREFIX': JSON.stringify(GATEWAY_API_PREFIX),
    })
  );
  return config;
};

function getRawHeader(rawHeaders, headerName) {
  const index = rawHeaders.indexOf(headerName);
  if (index === -1) {
    return null;
  }
  return rawHeaders[index + 1];
}
