const webpackConfig = require('./webpack.config');
const env = require('./environment.cjs');
const { PLATFORM_SERVER } = env;
const proxyUrl = new URL(PLATFORM_SERVER);
module.exports = function (env, argv) {
  const config = webpackConfig(env, argv);

  config.entry = './frontend/chatbot/ChatbotPortal.tsx';

  // publicPath is the path where the bundle is served from
  // https://webpack.js.org/guides/public-path/
  config.output.publicPath = process.env.PUBLIC_PATH || process.env.ROUTE_PREFIX || '/';

  config.devServer.proxy = [
    {
      context: ['/api'],
      target: PLATFORM_SERVER,
      secure: false,
      router: (req) => {
        req.headers.host = proxyUrl.host;
        req.headers.origin = proxyUrl.origin;
        req.headers.referer = proxyUrl.href;
      },
    },
  ];
  return config;
};
