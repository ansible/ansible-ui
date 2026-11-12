import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const mockGetPageUrl = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: (opts: { header: string; to?: (item: PlatformTeam) => string }) => ({
    id: 'name',
    header: opts.header,
    __to: opts.to,
  }),
  useDescriptionColumn: () => ({ id: 'description', header: 'Description' }),
  useOrganizationNameColumn: (route: string, _opts: unknown) => ({
    id: 'org',
    header: 'Organization',
    route,
  }),
  useCreatedColumn: (opts: { sort: string }) => ({
    id: 'created',
    header: 'Created',
    sort: opts.sort,
  }),
  useModifiedColumn: (opts: { sort: string }) => ({
    id: 'modified',
    header: 'Modified',
    sort: opts.sort,
  }),
}));

import { useTeamColumns } from './useTeamColumns';

const sampleTeam: PlatformTeam = {
  id: 77,
  name: 'Gamma',
  description: 'd',
  url: '/api/gateway/v1/teams/77/',
  created: '',
  created_by: '1',
  modified: '',
  modified_by: '1',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 1, name: 'Org' },
    resource: { ansible_id: 'x', resource_type: 'team' },
  },
  organization: 1,
  users: [],
};

describe('useTeamColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageUrl.mockImplementation((route: string, ctx: { params: { id: number } }) => {
      return `/mock/${route}/${ctx.params.id}`;
    });
  });

  test('returns columns with name linking to team details', () => {
    const { result } = renderHook(() => useTeamColumns());

    const nameCol = result.current[0] as { __to?: (t: PlatformTeam) => string };
    expect(typeof nameCol.__to).toBe('function');
    expect(nameCol.__to!(sampleTeam)).toBe(`/mock/${PlatformRoute.TeamDetails}/77`);
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.TeamDetails, { params: { id: 77 } });
  });

  test('passes disableLinks and disableSort into name and related columns', () => {
    const { result } = renderHook(() => useTeamColumns({ disableLinks: true, disableSort: true }));

    const nameCol = result.current[0] as { id: string };
    expect(nameCol.id).toBe('name');
    expect(result.current.map((c) => (c as { id: string }).id)).toEqual([
      'name',
      'description',
      'org',
      'created',
      'modified',
    ]);
  });
});
