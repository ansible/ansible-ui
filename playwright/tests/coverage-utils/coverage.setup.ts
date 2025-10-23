import { test } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import MCR from 'monocart-coverage-reports';
import { coverageOptions } from './coverage-options';

test('coverage - setup', () => {
  // Skip coverage setup if SKIP_COVERAGE is set
  if (process.env.SKIP_COVERAGE === 'true') {
    test.skip();
    return;
  }

  if (!existsSync('coverage')) {
    mkdirSync('coverage');
  }
  const mcr = MCR(coverageOptions);
  mcr.cleanCache();
});
