/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useApplicationName } from './useApplicationName';

describe('useApplicationName', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should default to Ansible when APPLICATION_NAME is unset', () => {
    const { result } = renderHook(() => useApplicationName());
    expect(result.current).toBe('Ansible');
  });

  it('should use APPLICATION_NAME when set', () => {
    vi.stubEnv('APPLICATION_NAME', 'Custom Application');
    const { result } = renderHook(() => useApplicationName());
    expect(result.current).toBe('Custom Application');
  });
});
