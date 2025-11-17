import { CoverageReportOptions } from 'monocart-coverage-reports';
import path from 'path';

export const coverageOptions: CoverageReportOptions = {
  name: 'AAP UI Playwright Coverage Report',
  logging: 'off',
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
  include: ['**/*.ts', '**/*.tsx'],
  exclude: ['**/node_modules/**', '**/*.css'],
  outputDir: 'coverage/playwright',
  reports: [
    // raw V8 entries
    ['raw', { outputDir: 'raw' }],
    // Istanbul JSON report
    ['json', { outputFile: 'coverage-final.json' }],
    // LCOV report for SonarQube
    ['lcov'],
  ],
  sourcePath: (filePath, info) => {
    const __dirname = import.meta.dirname;
    const repoRoot = path.resolve(__dirname, '../../..');
    let p;

    // Use absolute path if provided in info
    if (info?.distFile && path.isAbsolute(info.distFile)) {
      p = info.distFile;
    } else {
      // Strip Playwright dev-server prefixes
      p = filePath.replace(/^\/?localhost:\d+\/@?fs\//, '').replace(/^\/@?fs\//, '');

      // Prepend leading slash if missing
      if (!p.startsWith('/')) p = '/' + p;
    }

    // Remove duplicate repoRoot if it exists
    const idx = p.lastIndexOf(repoRoot);
    if (idx !== -1) {
      p = p.slice(idx);
    } else {
      p = path.resolve(repoRoot, p.replace(/^\/+/, ''));
    }

    return p;
  },
};
