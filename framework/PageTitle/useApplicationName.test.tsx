/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useApplicationName } from './useApplicationName';

describe('useApplicationName', () => {
  it('should default to Ansible', () => {
    const { result } = renderHook(() => useApplicationName());
    expect(result.current).toBe('Ansible');
  });
});
