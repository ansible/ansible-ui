/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { TeamRoleEntry } from '../../organizations/hooks/useOrganizationTeamsWithRoles';
import { useOrganizationTeamColumns } from './useOrganizationTeamColumns';

const emptyRolesByTeamId = new Map<number, TeamRoleEntry[]>();

const mockTeam = {
  id: 1,
  name: 'test-team',
  organization: 1,
  description: '',
  url: '/api/gateway/v1/teams/1/',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    organization: { id: 1, name: 'org_test1' },
    resource: { ansible_id: 'aaaa-0000', resource_type: 'shared.team' },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
  },
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  users: [],
} as unknown as PlatformTeam;

describe('useOrganizationTeamColumns', () => {
  it('returns three columns', () => {
    const { result } = renderHook(() => useOrganizationTeamColumns(emptyRolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(3);
  });

  it('includes Name column', () => {
    const { result } = renderHook(() => useOrganizationTeamColumns(emptyRolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    expect(nameColumn?.sort).toBe('name');
    expect(nameColumn?.defaultSort).toBe(true);
  });

  it('links the team name to team details by default', () => {
    const { result } = renderHook(() => useOrganizationTeamColumns(emptyRolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    if (!nameColumn || !('cell' in nameColumn)) throw new Error('Name column missing cell');

    const cell = nameColumn.cell(mockTeam) as ReactElement<{ to?: string }>;
    expect(cell.props.to).toBeDefined();
  });

  it('does not link the team name when links are disabled', () => {
    const { result } = renderHook(
      () => useOrganizationTeamColumns(emptyRolesByTeamId, { disableLinks: true }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    if (!nameColumn || !('cell' in nameColumn)) throw new Error('Name column missing cell');

    const cell = nameColumn.cell(mockTeam) as ReactElement<{ to?: string }>;
    expect(cell.props.to).toBeUndefined();
  });

  it('includes Organization column', () => {
    const { result } = renderHook(() => useOrganizationTeamColumns(emptyRolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const orgColumn = result.current.find((col) => col.header === 'Organization');
    expect(orgColumn).toBeDefined();
    expect(orgColumn?.type).toBe('text');
    const value = (orgColumn!.value as (t: PlatformTeam) => string)(mockTeam);
    expect(value).toBe('org_test1');
  });

  it('includes Organization roles column', () => {
    const { result } = renderHook(() => useOrganizationTeamColumns(emptyRolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const rolesColumn = result.current.find((col) => col.header === 'Organization roles');
    expect(rolesColumn).toBeDefined();
    if (!rolesColumn || !('cell' in rolesColumn))
      throw new Error('Organization roles column missing cell');
    expect(typeof rolesColumn.cell).toBe('function');
  });

  it('Organization roles column renders empty labels for team with no roles', () => {
    const { result } = renderHook(() => useOrganizationTeamColumns(emptyRolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    // The ?? [] fallback path: team not in map returns empty array
    const rolesColumn = result.current.find((col) => col.header === 'Organization roles');
    expect(rolesColumn).toBeDefined();
    if (!rolesColumn || !('cell' in rolesColumn))
      throw new Error('Organization roles column missing cell');
    // cell should not throw when team has no roles in the map
    expect(() => rolesColumn.cell(mockTeam)).not.toThrow();
  });

  it('Organization roles column renders labels for team with roles', () => {
    const rolesByTeamId = new Map<number, TeamRoleEntry[]>([
      [1, [{ name: 'Organization Admin', id: 5 }]],
    ]);

    const { result } = renderHook(() => useOrganizationTeamColumns(rolesByTeamId), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const rolesColumn = result.current.find((col) => col.header === 'Organization roles');
    expect(rolesColumn).toBeDefined();
    if (!rolesColumn || !('cell' in rolesColumn))
      throw new Error('Organization roles column missing cell');
    expect(() => rolesColumn.cell(mockTeam)).not.toThrow();
  });

  it('respects disableLinks option', () => {
    const { result } = renderHook(
      () => useOrganizationTeamColumns(emptyRolesByTeamId, { disableLinks: true }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    // Should still return 3 columns — disableLinks only affects the Name cell's `to` prop
    expect(result.current).toHaveLength(3);
  });
});
