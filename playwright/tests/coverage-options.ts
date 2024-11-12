import { CoverageReportOptions } from 'monocart-coverage-reports';

export const coverageOptions: CoverageReportOptions = {
  name: 'AAP UI Coverage Report',
  outputDir: './coverage',
  reports: ['v8', 'lcovonly'],
  entryFilter: (entry) => {
    if (entry.url.search(/node_modules/) !== -1) {
      return false;
    }
    if (entry.url.search(/localhost/) !== -1) {
      return false;
    }
    return true;
  },
};
