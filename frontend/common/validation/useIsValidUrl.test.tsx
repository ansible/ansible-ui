import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useIsValidUrl } from './useIsValidUrl';

describe('useIsValidUrl', () => {
  it('should accept empty url', () => {
    const { result } = renderHook(() => useIsValidUrl());
    expect(result.current('')).toBe(true);
  });

  it('should accept http and https urls with host', () => {
    const { result } = renderHook(() => useIsValidUrl());
    expect(result.current('https://example.com/path')).toBeUndefined();
    expect(result.current('http://example.com')).toBeUndefined();
  });

  it('should reject invalid protocol', () => {
    const { result } = renderHook(() => useIsValidUrl());
    expect(result.current('ftp://example.com')).toBe('Must be a valid protocol ftp:');
  });

  it('should reject malformed url', () => {
    const { result } = renderHook(() => useIsValidUrl());
    expect(result.current('not-a-url')).toBe('Must be a valid URL.');
  });
});
