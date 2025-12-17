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
    let absolutePath;

    // Use absolute path if provided in info
    if (info?.distFile && path.isAbsolute(info.distFile)) {
      absolutePath = info.distFile;
    } else {
      // Strip Playwright dev-server prefixes
      let p = filePath.replace(/^\/?localhost:\d+\/@?fs\//, '').replace(/^\/@?fs\//, '');

      // Fix: if path is missing leading slash but looks like absolute path, add it
      // This handles cases where monocart passes "home/runner/..." instead of "/home/runner/..."
      if (!p.startsWith('/') && (p.startsWith('home/') || p.startsWith('Users/'))) {
        p = '/' + p;
      }

      // Determine absolute path
      if (path.isAbsolute(p)) {
        absolutePath = p;
      } else {
        absolutePath = path.resolve(repoRoot, p);
      }
    }

    // CRITICAL: Return ABSOLUTE path for NYC compatibility
    // NYC merge requires absolute paths as keys in coverage JSON files
    // NYC report will convert them to relative paths when generating LCOV for SonarQube
    return absolutePath;
  },
};
