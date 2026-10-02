import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frameworkDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(frameworkDir, '..');

/** Vitest aliases shared across all workspace test configs. */
export function getVitestAliases() {
  return [
    {
      // Exact match only — do not alias subpaths like @testing-library/react/pure
      find: /^@testing-library\/react$/,
      replacement: path.join(frameworkDir, 'test-utils/testing-library.tsx'),
    },
    {
      find: /^monaco-editor$/,
      replacement: path.join(repoRoot, 'node_modules/monaco-editor/esm/vs/index'),
    },
  ];
}
