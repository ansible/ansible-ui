/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useSelectOrganization } from './useSelectOrganization';

describe('useSelectOrganization', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useSelectOrganization(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toBeInstanceOf(Function);
  });

  it('should be callable with organization selection parameters', () => {
    const { result } = renderHook(() => useSelectOrganization(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(() => {
      result.current(() => {}, { id: 1, name: 'Test Org' } as PlatformOrganization);
    }).not.toThrow();
  });
});
