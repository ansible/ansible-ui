const webpackConfig = require('./webpack.config');
module.exports = function (_env, argv) {
  const config = webpackConfig(_env, argv);
  config.devServer.proxy = {
    '/api': {
      target: 'http://localhost:8000',
      secure: false,
    },
  };
  return config;
};
