import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformEdaUserIdLookup } from './PlatformEdaUserIdLookup';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">Loading</div>,
  };
});

vi.mock('@ansible/eda-ui/common/EdaError', () => ({
  EdaError: (props: Readonly<{ error: { message: string } }>) => (
    <div data-testid="eda-error">{props.error.message}</div>
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
    resource: { ansible_id: 'eda-uid', resource_type: 'user' },
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
            <PlatformEdaUserIdLookup>
              <Child />
            </PlatformEdaUserIdLookup>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformEdaUserIdLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMocks.useGetItem.mockReturnValue({
      data: gatewayUser,
      error: undefined,
      isLoading: false,
    });
  });

  it('shows loading while EDA users are loading', () => {
    getMocks.useGet.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });
    renderLookup();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('passes EDA user id to child when exactly one match', () => {
    getMocks.useGet.mockReturnValue({
      data: { count: 1, results: [{ id: 99, username: 'e' }] },
      error: undefined,
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('child-id')).toHaveTextContent('99');
  });

  it('renders EdaError on failure', () => {
    getMocks.useGet.mockReturnValue({
      data: undefined,
      error: { message: 'eda down' },
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('eda-error')).toHaveTextContent('eda down');
  });

  it('shows not found when not exactly one EDA user', () => {
    getMocks.useGet.mockReturnValue({
      data: { count: 2, results: [{ id: 1 }, { id: 2 }] },
      error: undefined,
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
  });
});
