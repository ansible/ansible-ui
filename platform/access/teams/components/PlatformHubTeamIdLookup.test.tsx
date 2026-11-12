import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformHubTeamIdLookup } from './PlatformHubTeamIdLookup';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">Loading</div>,
  };
});

vi.mock('@ansible/hub-ui/common/HubError', () => ({
  HubError: (props: Readonly<{ error: { message: string } }>) => (
    <div data-testid="hub-error">{props.error.message}</div>
  ),
}));

const getMocks = vi.hoisted(() => ({
  useGetItem: vi.fn(),
  useHubResource: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: getMocks.useGetItem as typeof actual.useGetItem,
  };
});

vi.mock('../../../hooks/useHubResource', async () => {
  const actual = await vi.importActual<typeof import('../../../hooks/useHubResource')>(
    '../../../hooks/useHubResource'
  );
  return {
    ...actual,
    useHubResource: getMocks.useHubResource as typeof actual.useHubResource,
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
    resource: { ansible_id: 'hub-ansible', resource_type: 'team' },
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
            <PlatformHubTeamIdLookup>
              <Child />
            </PlatformHubTeamIdLookup>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformHubTeamIdLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMocks.useGetItem.mockReturnValue({
      data: gatewayTeam,
      error: undefined,
      isLoading: false,
    });
  });

  it('shows loading while Hub resource loads', () => {
    getMocks.useHubResource.mockReturnValue({
      resource: undefined,
      isLoading: true,
      error: undefined,
    });
    renderLookup();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('passes Hub team id to child', () => {
    getMocks.useHubResource.mockReturnValue({
      resource: { id: 77, name: 'Hub team' },
      isLoading: false,
      error: undefined,
    });
    renderLookup();
    expect(screen.getByTestId('child-id')).toHaveTextContent('77');
  });

  it('renders HubError on failure', () => {
    getMocks.useHubResource.mockReturnValue({
      resource: undefined,
      isLoading: false,
      error: { message: 'hub down' },
    });
    renderLookup();
    expect(screen.getByTestId('hub-error')).toHaveTextContent('hub down');
  });

  it('shows not found when hub returns no resource', () => {
    getMocks.useHubResource.mockReturnValue({
      resource: undefined,
      isLoading: false,
      error: undefined,
    });
    renderLookup();
    expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
  });
});
