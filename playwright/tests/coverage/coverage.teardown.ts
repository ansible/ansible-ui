import { test } from '@playwright/test';
import { existsSync } from 'fs';
import MCR from 'monocart-coverage-reports';
import { coverageOptions } from './coverage-options';

test('coverage - report', async () => {
  if (existsSync('coverage')) {
    const mcr = MCR(coverageOptions);
    await mcr.generate();
    // Open the coverage report in the default browser
    // exec('open coverage/index.html');
  }
});
