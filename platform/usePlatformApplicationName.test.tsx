/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import * as applicationName from './applicationName';
import { usePlatformApplicationName } from './usePlatformApplicationName';

describe('usePlatformApplicationName', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should default to Ansible when build name is empty', () => {
    vi.spyOn(applicationName, 'getBuildApplicationName').mockReturnValue('');
    const { result } = renderHook(() => usePlatformApplicationName());
    expect(result.current).toBe('Ansible');
  });

  it('should use build-time APPLICATION_NAME when set', () => {
    vi.spyOn(applicationName, 'getBuildApplicationName').mockReturnValue('Configured Name');
    const { result } = renderHook(() => usePlatformApplicationName());
    expect(result.current).toBe('Configured Name');
  });
});
