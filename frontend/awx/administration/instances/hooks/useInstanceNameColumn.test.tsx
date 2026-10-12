import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useInstanceNameColumn } from './useInstanceNameColumn';

describe('useInstanceNameColumn', () => {
  test('returns a name column configured for instances', () => {
    const { result } = renderHook(() => useInstanceNameColumn(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.header).toBe('Name');
    expect(result.current.sort).toBe('hostname');
    expect(result.current.defaultSort).toBe(true);
    expect(result.current.to).toBeTypeOf('function');
  });

  test('omits links when disableLinks is set', () => {
    const { result } = renderHook(() => useInstanceNameColumn({ disableLinks: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.to).toBeUndefined();
  });
});
