/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { useDeleteOrganizations } from './useDeleteOrganizations';

describe('useDeleteOrganizations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  const createMockOrganization = (overrides: Partial<EdaOrganization> = {}): EdaOrganization =>
    ({
      id: 1,
      name: 'Test Organization',
      description: 'A test organization',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      ...overrides,
    }) as EdaOrganization;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should accept an array of organizations when called', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    const orgs = [createMockOrganization({ id: 1, name: 'Org A' })];

    expect(() => result.current(orgs)).not.toThrow();
  });

  it('should handle multiple organizations', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    const orgs = [
      createMockOrganization({ id: 1, name: 'Org A' }),
      createMockOrganization({ id: 2, name: 'Org B' }),
      createMockOrganization({ id: 3, name: 'Org C' }),
    ];

    expect(() => result.current(orgs)).not.toThrow();
  });

  it('should handle an empty array of organizations', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), { wrapper });

    expect(() => result.current([])).not.toThrow();
  });
});
