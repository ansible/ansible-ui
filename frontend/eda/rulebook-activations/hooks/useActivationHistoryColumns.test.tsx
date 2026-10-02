/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useActivationHistoryColumns } from './useActivationHistoryColumns';

describe('useActivationHistoryColumns', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('should return an array of table columns', () => {
    const { result } = renderHook(() => useActivationHistoryColumns(), { wrapper });
    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBe(3);
  });

  it('should have a Name column', () => {
    const { result } = renderHook(() => useActivationHistoryColumns(), { wrapper });
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    expect(nameColumn?.card).toBe('name');
    expect(nameColumn?.list).toBe('name');
  });

  it('should have a Status column', () => {
    const { result } = renderHook(() => useActivationHistoryColumns(), { wrapper });
    const statusColumn = result.current.find((col) => col.header === 'Status');
    expect(statusColumn).toBeDefined();
  });

  it('should have a Start date column', () => {
    const { result } = renderHook(() => useActivationHistoryColumns(), { wrapper });
    const dateColumn = result.current.find((col) => col.header === 'Start date');
    expect(dateColumn).toBeDefined();
  });
});
