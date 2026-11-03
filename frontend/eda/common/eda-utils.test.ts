import { afterEach, describe, expect, it } from 'vitest';
import { edaAPI, edaApiPath, hasCopyNamePattern, setEdaApiPath } from './eda-utils';

describe('eda-utils', () => {
  const originalPath = edaApiPath;

  afterEach(() => {
    setEdaApiPath(originalPath ?? '/api/eda/v1');
  });

  it('should prefix tagged paths with the configured API path', () => {
    setEdaApiPath('/api/eda/v1');
    expect(edaAPI`/event-streams/${42}/`).toBe('/api/eda/v1/event-streams/42/');
  });

  it('should reject names that are too short to contain a copy marker', () => {
    expect(hasCopyNamePattern('short')).toBe(false);
    expect(hasCopyNamePattern('')).toBe(false);
  });

  it('should reject names that do not end with a copy marker', () => {
    expect(hasCopyNamePattern('activation-copy-name')).toBe(false);
  });

  it('should match names ending with a copy timestamp', () => {
    expect(hasCopyNamePattern('activation @ 12:34:56')).toBeTruthy();
  });

  it('should reject names with a marker but an invalid time', () => {
    expect(hasCopyNamePattern('activation @ 99:99:99')).toBeFalsy();
  });
});
