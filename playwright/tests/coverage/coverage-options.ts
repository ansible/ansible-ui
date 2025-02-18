import { CoverageReportOptions } from 'monocart-coverage-reports';

export const coverageOptions: CoverageReportOptions = {
  name: 'AAP UI Coverage Report',
  outputDir: './coverage',
  reports: ['v8', 'lcovonly', 'text-summary'],
  entryFilter: (entry) => {
    let shouldInclude = false;
    for (const path of ['frontend/', 'platform/', 'framework/']) {
      if (entry.url.includes(path)) {
        shouldInclude = true;
        break;
      }
    }
    return shouldInclude;
  },
};
