const webpackConfig = require('./webpack.config');

const edaServer = process.env.EDA_SERVER ?? 'http://localhost:8000';
const proxyUrl = new URL(edaServer);

module.exports = function (_env, argv) {
  const config = webpackConfig(_env, argv);
  config.devServer.proxy = {
    '/api': {
      target: edaServer,
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
