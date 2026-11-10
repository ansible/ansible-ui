import { describe, expect, it, afterEach } from 'vitest';
import { getBuildApplicationName } from './applicationName';

function setApplicationNameForTest(value: string) {
  (import.meta.env as { APPLICATION_NAME: string }).APPLICATION_NAME = value;
}

describe('getBuildApplicationName', () => {
  const originalEnv = import.meta.env.APPLICATION_NAME;

  afterEach(() => {
    setApplicationNameForTest(originalEnv);
  });

  it('should return empty string when APPLICATION_NAME is unset', () => {
    setApplicationNameForTest('');
    expect(getBuildApplicationName()).toBe('');
  });

  it('should return APPLICATION_NAME when configured', () => {
    setApplicationNameForTest('Configured Name');
    expect(getBuildApplicationName()).toBe('Configured Name');
  });
});
