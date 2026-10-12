import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useInstanceNameColumn } from './useInstanceNameColumn';

describe('useInstanceNameColumn', () => {
  test('returns a name column configured for instances', () => {
    const { result } = renderHook(() => useInstanceNameColumn(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toMatchObject({
      header: 'Name',
      sort: 'hostname',
      defaultSort: true,
      type: 'text',
    });
    if (result.current.type === 'text') {
      expect(result.current.to).toBeTypeOf('function');
    }
  });

  test('omits links when disableLinks is set', () => {
    const { result } = renderHook(() => useInstanceNameColumn({ disableLinks: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.type).toBe('text');
    if (result.current.type === 'text') {
      expect(result.current.to).toBeUndefined();
    }
  });
});
