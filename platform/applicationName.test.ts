import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { getBuildApplicationName } from './applicationName';

describe('getBuildApplicationName', () => {
  const originalEnv = import.meta.env.APPLICATION_NAME;

  beforeEach(() => {
    import.meta.env.APPLICATION_NAME = '';
  });

  afterEach(() => {
    import.meta.env.APPLICATION_NAME = originalEnv;
  });

  it('should return empty string when APPLICATION_NAME is unset', () => {
    expect(getBuildApplicationName()).toBe('');
  });

  it('should return APPLICATION_NAME when configured', () => {
    import.meta.env.APPLICATION_NAME = 'Configured Name';
    expect(getBuildApplicationName()).toBe('Configured Name');
  });
});
