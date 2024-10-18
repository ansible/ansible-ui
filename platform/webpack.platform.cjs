const webpackConfig = require('../webpack/webpack.config');
const CopyPlugin = require('copy-webpack-plugin');

const PLATFORM_SERVER = process.env.PLATFORM_SERVER || 'https://localhost:443';

const proxyUrl = new URL(PLATFORM_SERVER);

module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './platform/main/Platform.tsx';

  config.plugins.unshift(new CopyPlugin({ patterns: [{ from: 'platform/assets', to: 'assets' }] }));

  config.devServer.proxy = [
    {
      context: ['/o/'],
      target: PLATFORM_SERVER,
      secure: false,
      router: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
    {
      context: ['/api/'],
      target: PLATFORM_SERVER,
      secure: false,
      router: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
    {
      context: ['/sso'],
      target: PLATFORM_SERVER,
      secure: false,
      router: (req) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
    {
      context: ['/api/controller/v2/websocket'],
      target: PLATFORM_SERVER,
      secure: false,
      ws: true,
      router: (req) => {
        req.headers.origin = proxyUrl.origin;
        req.headers.host = getRawHeader(req.rawHeaders, 'Host') || proxyUrl.host;
        req.referrer = getRawHeader(req.rawHeaders, 'Referer') || proxyUrl.href;
      },
    },
  ];

  return config;
};

function getRawHeader(rawHeaders, headerName) {
  const index = rawHeaders.indexOf(headerName);
  if (index === -1) {
    return null;
  }
  return rawHeaders[index + 1];
}
