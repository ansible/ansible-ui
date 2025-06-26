/* eslint-disable no-console */

import * as fs from 'fs';
import { globSync } from 'glob';
import * as path from 'path';

interface Location {
  line: number;
  column: number;
}

interface Range {
  start: Location;
  end: Location;
}
// JSON structure for file coverage
interface FileCoverage {
  path: string;
  statementMap: { [key: string]: Range };
  fnMap: { [key: string]: { name: string; decl: Range; loc: Range; line: number } };
  branchMap: { [key: string]: { loc: Range; type: string; locations: Range[]; line: number } };
  s: { [key: string]: number };
  f: { [key: string]: number };
  b: { [key: string]: number[] };
  [key: string]: unknown;
}

interface CoverageMap {
  [filePath: string]: FileCoverage;
}

/**
 * Finds all Playwright coverage files and normalizes the `path` property within them.
 */
function fixAllCoveragePaths(): void {
  const searchPattern = '.nyc_output/*-playwright.json';

  const coverageFiles = globSync(searchPattern, { ignore: '**/node_modules/**' });

  if (coverageFiles.length === 0) {
    console.log('No Playwright coverage files found to process.');
    return;
  }

  console.log(`Found ${coverageFiles.length} coverage file(s) to process.`);

  coverageFiles.forEach(processCoverageFile);

  console.log('✅ All coverage files have been processed.');
}

/**
 * Reads a single coverage file, fixes its internal paths, and writes it back.
 * @param filePath
 */
function processCoverageFile(filePath: string): void {
  console.log(`\nProcessing: ${filePath}`);
  const resolvedCoverageFile = path.resolve(process.cwd(), filePath);

  try {
    const fileContent: string = fs.readFileSync(resolvedCoverageFile, 'utf8');
    const coverageData = JSON.parse(fileContent) as CoverageMap;
    let pathsFixed = 0;

    for (const key in coverageData) {
      if (Object.prototype.hasOwnProperty.call(coverageData, key)) {
        const fileCoverage = coverageData[key];

        if (
          fileCoverage &&
          typeof fileCoverage.path === 'string' &&
          !path.isAbsolute(fileCoverage.path)
        ) {
          const originalPath = fileCoverage.path;
          const newPath = `/${originalPath}`; // Prepend the leading slash

          fileCoverage.path = newPath;
          pathsFixed++;
        }
      }
    }

    if (pathsFixed > 0) {
      fs.writeFileSync(resolvedCoverageFile, JSON.stringify(coverageData, null, 2));
      console.log(`Fixed ${pathsFixed} path(s) in ${filePath}`);
    } else {
      console.log(`No paths needed fixing in ${filePath}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error processing file ${filePath}: ${errorMessage}`);
  }
}

fixAllCoveragePaths();
