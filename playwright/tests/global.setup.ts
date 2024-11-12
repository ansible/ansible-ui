import { test } from '@playwright/test';
import { existsSync, rmdirSync } from 'fs';

test('global - setup', () => {
  if (existsSync('coverage')) {
    rmdirSync('coverage', { recursive: true });
  }
});
