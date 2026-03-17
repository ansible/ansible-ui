module.exports = {
  appUrl: ['/ansible/automation-hub/', '/ansible/automation-hub'],
  useProxy: true,
  proxyVerbose: true,
  debug: true,
  plugins: [],
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      { 'react-router-dom': { singleton: true, version: '*', import: false } },
      { react: { singleton: true, version: '*', import: false } },
      { 'react-dom': { singleton: true, version: '*', import: false } },
    ],
  },
};
