const baseConfig = require('./webpack.config.cjs');
const path = require('path');

module.exports = function (env, argv) {
  let config = baseConfig(env, argv);
  // config.entry = './frontend/controller';
  config.output.path = path.resolve(__dirname, 'build/controller');
  return config;
};
