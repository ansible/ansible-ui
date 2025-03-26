import type { JSONReport } from '@playwright/test/reporter';
import Anser from 'anser';
import { readFileSync, writeFileSync } from 'fs';

const file = readFileSync('results.json');
const jsonReport = JSON.parse(file.toString()) as JSONReport;
const failures: string[] = [``, `### Test Failures`, ``];

let passCount = 0;
let failureCount = 0;

for (const suite of jsonReport.suites) {
  for (const spec of suite.specs) {
    for (const test of spec.tests) {
      switch (test.status) {
        case 'expected':
          passCount++;
          break;

        case 'unexpected':
        case 'flaky':
          failureCount++;
          for (const result of test.results) {
            if (result.error?.message) {
              failures.push(`<details>`);
              failures.push(`<summary>:x: ${spec.title}</summary>`);
              failures.push(``);
              failures.push('```');
              failures.push(`${Anser.ansiToText(result.error?.message)}`);
              failures.push('```');
              failures.push(`</details>`);
              failures.push(``);
            } else {
              failures.push(`${spec.title}`);
            }
          }
          break;
      }
    }
  }
}

const summary = `## Playwright Test Results
- Passed: ${passCount}
- Failed: ${failureCount}
`;

if (failures.length === 3) {
  writeFileSync('results.md', summary);
} else {
  writeFileSync('results.md', summary + failures.join('\n'));
}
