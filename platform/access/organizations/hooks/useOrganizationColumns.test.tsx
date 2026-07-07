import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useOrganizationColumns } from './useOrganizationColumns';

describe('useOrganizationColumns', () => {
  it('should return organization table columns', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
  });

  it('should include name column', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
  });

  it('should include description column', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const descriptionColumn = result.current.find((col) => col.header === 'Description');
    expect(descriptionColumn).toBeDefined();
  });

  it('should include users count column', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const usersColumn = result.current.find((col) => col.header === 'Users');
    expect(usersColumn).toBeDefined();
    expect(usersColumn?.type).toBe('count');
  });

  it('should include teams count column', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const teamsColumn = result.current.find((col) => col.header === 'Teams');
    expect(teamsColumn).toBeDefined();
    expect(teamsColumn?.type).toBe('count');
  });

  it('should include created column', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const createdColumn = result.current.find((col) => col.header === 'Created');
    expect(createdColumn).toBeDefined();
  });

  it('should include modified column', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const modifiedColumn = result.current.find((col) => col.header === 'Last modified');
    expect(modifiedColumn).toBeDefined();
  });

  it('should return 6 columns total', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.length).toBe(6);
  });

  it('should support disableLinks option', () => {
    const { result } = renderHook(() => useOrganizationColumns({ disableLinks: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toBeDefined();
    expect(result.current.length).toBe(6);
  });

  it('should support disableSort option', () => {
    const { result } = renderHook(() => useOrganizationColumns({ disableSort: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toBeDefined();
    expect(result.current.length).toBe(6);
  });

  it('should extract users count from summary fields', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const usersColumn = result.current.find((col) => col.header === 'Users');
    expect(usersColumn).toBeDefined();
    expect(typeof usersColumn!.value).toBe('function');

    const mockOrg = {
      id: 1,
      name: 'Test Org',
      summary_fields: {
        related_field_counts: {
          users: 10,
          teams: 5,
        },
      },
    } as PlatformOrganization;

    const count = (usersColumn!.value as (org: PlatformOrganization) => number)(mockOrg);
    expect(count).toBe(10);
  });

  it('should extract teams count from summary fields', () => {
    const { result } = renderHook(() => useOrganizationColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const teamsColumn = result.current.find((col) => col.header === 'Teams');
    expect(teamsColumn).toBeDefined();
    expect(typeof teamsColumn!.value).toBe('function');

    const mockOrg = {
      id: 1,
      name: 'Test Org',
      summary_fields: {
        related_field_counts: {
          users: 10,
          teams: 5,
        },
      },
    } as PlatformOrganization;

    const count = (teamsColumn!.value as (org: PlatformOrganization) => number)(mockOrg);
    expect(count).toBe(5);
  });
});
