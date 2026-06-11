import { test } from '@playwright/test';
import { existsSync, rmSync } from 'fs';

test('global - setup', () => {
  if (existsSync('coverage')) {
    rmSync('coverage', { recursive: true });
  }
});
