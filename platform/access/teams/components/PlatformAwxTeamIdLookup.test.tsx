import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformAwxTeamIdLookup } from './PlatformAwxTeamIdLookup';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">Loading</div>,
  };
});

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: (props: Readonly<{ error: { message: string } }>) => (
    <div data-testid="awx-error">{props.error.message}</div>
  ),
}));

const getMocks = vi.hoisted(() => ({
  useGetItem: vi.fn(),
  useGet: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: getMocks.useGetItem as typeof actual.useGetItem,
    useGet: getMocks.useGet as typeof actual.useGet,
  };
});

const gatewayTeam: PlatformTeam = {
  id: 5,
  name: 'Gateway team',
  description: '',
  url: '/api/gateway/v1/teams/5/',
  created: '',
  created_by: '1',
  modified: '',
  modified_by: '1',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 1, name: 'O' },
    resource: { ansible_id: 'ansible-team-1', resource_type: 'team' },
  },
  organization: 1,
  users: [],
};

function Child(props: Readonly<{ id?: string }>) {
  return <div data-testid="child-id">{props.id ?? 'none'}</div>;
}

function renderLookup() {
  return render(
    <MemoryRouter initialEntries={['/platform/teams/5']}>
      <Routes>
        <Route
          path="/platform/teams/:id"
          element={
            <PlatformAwxTeamIdLookup>
              <Child />
            </PlatformAwxTeamIdLookup>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformAwxTeamIdLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMocks.useGetItem.mockReturnValue({
      data: gatewayTeam,
      error: undefined,
      isLoading: false,
    });
  });

  it('shows loading while AWX teams are loading', () => {
    getMocks.useGet.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });
    renderLookup();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('clones child with AWX team id when exactly one match', () => {
    getMocks.useGet.mockReturnValue({
      data: { count: 1, results: [{ id: 9001, name: 'AWX Team' }] },
      error: undefined,
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('child-id')).toHaveTextContent('9001');
  });

  it('renders AwxError when AWX teams request fails', () => {
    getMocks.useGet.mockReturnValue({
      data: undefined,
      error: { message: 'boom' },
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('awx-error')).toHaveTextContent('boom');
  });

  it('shows not found when AWX returns zero or multiple teams', () => {
    getMocks.useGet.mockReturnValue({
      data: { count: 0, results: [] },
      error: undefined,
      isLoading: false,
    });
    const { rerender } = renderLookup();
    expect(screen.getByText('Resource Not Found')).toBeInTheDocument();

    getMocks.useGet.mockReturnValue({
      data: { count: 2, results: [{ id: 1 }, { id: 2 }] },
      error: undefined,
      isLoading: false,
    });
    rerender(
      <MemoryRouter initialEntries={['/platform/teams/5']}>
        <Routes>
          <Route
            path="/platform/teams/:id"
            element={
              <PlatformAwxTeamIdLookup>
                <Child />
              </PlatformAwxTeamIdLookup>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
  });
});
