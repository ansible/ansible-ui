import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frameworkDir = path.dirname(fileURLToPath(import.meta.url));

/** Vitest aliases shared across all workspace test configs. */
export function getVitestAliases() {
  return [
    {
      // Exact match only — do not alias subpaths like @testing-library/react/pure
      find: /^@testing-library\/react$/,
      replacement: path.join(frameworkDir, 'test-utils/testing-library.tsx'),
    },
  ];
}
