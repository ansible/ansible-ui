const webpack = require('webpack');
const config = require('./webpack.config.cjs');

const compiler = webpack(config);
compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) console.error(err.details);
    process.exit(1);
  }

  if (stats.hasErrors()) {
    console.error('=== WEBPACK ERRORS ===');
    console.error(stats.toString({ errors: true, warnings: false, colors: false }));
    console.error('=== END WEBPACK ERRORS ===');
  }

  console.log(stats.toString({ errors: false, warnings: true, colors: false }));

  compiler.close((closeErr) => {
    if (closeErr) console.error(closeErr);
    process.exit(stats.hasErrors() ? 1 : 0);
  });
});
