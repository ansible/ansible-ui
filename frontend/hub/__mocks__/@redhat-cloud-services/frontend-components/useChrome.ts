// Mock for @redhat-cloud-services/frontend-components/useChrome
// This package is only available in the insights/ isolated build environment
// but tests need to be able to import modules that use it

const useChrome = () => ({
  identifyApp: () => {},
  updateDocumentTitle: () => {},
});

// eslint-disable-next-line no-restricted-exports
export default useChrome;
