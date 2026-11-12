import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformHubUserIdLookup } from './PlatformHubUserIdLookup';

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

const gatewayUser: PlatformUser = {
  id: 5,
  url: '/u/5',
  created: '',
  created_by: '1',
  modified: '',
  modified_by: '1',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'hub-ansible', resource_type: 'user' },
  },
  username: 'pat',
  last_login_map_results: [],
  managed: false,
};

function Child(props: Readonly<{ id?: string }>) {
  return <div data-testid="child-id">{props.id ?? 'none'}</div>;
}

function renderLookup() {
  return render(
    <MemoryRouter initialEntries={['/platform/users/5']}>
      <Routes>
        <Route
          path="/platform/users/:id"
          element={
            <PlatformHubUserIdLookup>
              <Child />
            </PlatformHubUserIdLookup>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformHubUserIdLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMocks.useGetItem.mockReturnValue({
      data: gatewayUser,
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

  it('passes Hub user id to child', () => {
    getMocks.useHubResource.mockReturnValue({
      resource: { id: 77, username: 'h' },
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
      error: { message: 'hub err' },
    });
    renderLookup();
    expect(screen.getByTestId('hub-error')).toHaveTextContent('hub err');
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
