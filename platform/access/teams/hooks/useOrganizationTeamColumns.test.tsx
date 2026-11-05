import { ITableColumn } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
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

function renderColumns(
  rolesByTeamId: Map<number, TeamRoleEntry[]>,
  options?: { disableLinks?: boolean }
) {
  return renderHook(() => useOrganizationTeamColumns(rolesByTeamId, options), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function getColumnParts(columns: ITableColumn<PlatformTeam>[]) {
  const [nameColumn, organizationColumn, organizationRolesColumn] = columns;
  return { nameColumn, organizationColumn, organizationRolesColumn };
}

function cellColumn(column: ITableColumn<PlatformTeam>) {
  if (!('cell' in column)) {
    throw new Error('Expected column with cell renderer');
  }
  return column;
}

describe('useOrganizationTeamColumns', () => {
  it('returns three columns', () => {
    const { result } = renderColumns(emptyRolesByTeamId);

    expect(result.current).toHaveLength(3);
  });

  it('includes Name column', () => {
    const { result } = renderColumns(emptyRolesByTeamId);
    const { nameColumn } = getColumnParts(result.current);

    expect(nameColumn.sort).toBe('name');
    expect(nameColumn.defaultSort).toBe(true);
  });

  it('links the team name to team details by default', () => {
    const { result } = renderColumns(emptyRolesByTeamId);
    const { nameColumn } = getColumnParts(result.current);

    const cell = cellColumn(nameColumn).cell(mockTeam) as ReactElement<{ to?: string }>;
    expect(cell.props.to).toBeDefined();
  });

  it('does not link the team name when links are disabled', () => {
    const { result } = renderColumns(emptyRolesByTeamId, { disableLinks: true });
    const { nameColumn } = getColumnParts(result.current);

    const cell = cellColumn(nameColumn).cell(mockTeam) as ReactElement<{ to?: string }>;
    expect(cell.props.to).toBeUndefined();
  });

  it('includes Organization column', () => {
    const { result } = renderColumns(emptyRolesByTeamId);
    const { organizationColumn } = getColumnParts(result.current);

    expect(organizationColumn.type).toBe('text');
    expect(organizationColumn.sort).toBe('organization');
    const value = (organizationColumn.value as (t: PlatformTeam) => string)(mockTeam);
    expect(value).toBe('org_test1');
  });

  it('includes Organization roles column', () => {
    const { result } = renderColumns(emptyRolesByTeamId);
    const { organizationRolesColumn } = getColumnParts(result.current);

    expect(typeof cellColumn(organizationRolesColumn).cell).toBe('function');
  });

  it('Organization roles column renders empty labels for team with no roles', () => {
    const { result } = renderColumns(emptyRolesByTeamId);
    const { organizationRolesColumn } = getColumnParts(result.current);

    expect(() => cellColumn(organizationRolesColumn).cell(mockTeam)).not.toThrow();
  });

  it('Organization roles column renders labels for team with roles', () => {
    const rolesByTeamId = new Map<number, TeamRoleEntry[]>([
      [1, [{ name: 'Organization Admin', id: 5 }]],
    ]);

    const { result } = renderColumns(rolesByTeamId);
    const { organizationRolesColumn } = getColumnParts(result.current);

    expect(() => cellColumn(organizationRolesColumn).cell(mockTeam)).not.toThrow();
  });

  it('respects disableLinks option', () => {
    const { result } = renderColumns(emptyRolesByTeamId, { disableLinks: true });

    expect(result.current).toHaveLength(3);
  });
});
