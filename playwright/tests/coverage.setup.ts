import { test } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import MCR from 'monocart-coverage-reports';
import { coverageOptions } from './coverage-options';

test('coverage - setup', () => {
  if (!existsSync('coverage')) {
    mkdirSync('coverage');
  }
  const mcr = MCR(coverageOptions);
  mcr.cleanCache();
});
