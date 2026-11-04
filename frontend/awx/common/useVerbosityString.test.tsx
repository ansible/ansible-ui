import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useVerbosityString } from './useVerbosityString';

describe('useVerbosityString', () => {
  it('maps verbosity levels to labels', () => {
    expect(renderHook(() => useVerbosityString(0)).result.current).toBe('0 (Normal)');
    expect(renderHook(() => useVerbosityString(1)).result.current).toBe('1 (Verbose)');
    expect(renderHook(() => useVerbosityString(2)).result.current).toBe('2 (More Verbose)');
    expect(renderHook(() => useVerbosityString(3)).result.current).toBe('3 (Debug)');
    expect(renderHook(() => useVerbosityString(4)).result.current).toBe('4 (Connection Debug)');
    expect(renderHook(() => useVerbosityString(5)).result.current).toBe('5 (WinRM Debug)');
  });

  it('returns empty string for unknown values', () => {
    expect(renderHook(() => useVerbosityString(undefined)).result.current).toBe('');
    expect(renderHook(() => useVerbosityString(99)).result.current).toBe('');
  });
});
