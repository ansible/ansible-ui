/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCredentialsTestModal } from './useCredentialsTestModal';

describe('useCredentialsTestModal', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useCredentialsTestModal());
    expect(typeof result.current).toBe('function');
  });

  it('should return setProps function that can be called with undefined', () => {
    const { result } = renderHook(() => useCredentialsTestModal());
    expect(() => result.current(undefined)).not.toThrow();
  });
});
