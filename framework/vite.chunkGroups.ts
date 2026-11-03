/** Rolldown code-splitting groups that replace object-form `manualChunks`. */
export const vendorChunkGroups = [
  {
    name: 'patternfly',
    test: /[\\/]node_modules[\\/]@patternfly[\\/](react-core|react-icons|react-styles|react-table|react-tokens)([\\/]|$)/,
  },
  {
    name: 'pfcharts',
    test: /[\\/]node_modules[\\/]@patternfly[\\/]react-charts([\\/]|$)/,
  },
  {
    name: 'pfquickstarts',
    test: /[\\/]node_modules[\\/]@patternfly[\\/]quickstarts([\\/]|$)/,
  },
  {
    name: 'pftopology',
    test: /[\\/]node_modules[\\/]@patternfly[\\/]react-topology([\\/]|$)/,
  },
  {
    name: 'monaco-editor',
    test: /[\\/]node_modules[\\/]monaco-editor([\\/]|$)/,
  },
  {
    name: 'monaco-yaml',
    test: /[\\/]node_modules[\\/]monaco-yaml([\\/]|$)/,
  },
];
