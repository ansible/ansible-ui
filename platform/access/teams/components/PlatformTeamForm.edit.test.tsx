import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlatformTeam } from '../../../interfaces/PlatformTeam';
import type { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { EditPlatformTeam } from './PlatformTeamForm';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">loading</div>,
    PageNotFound: () => <div data-testid="page-not-found">not found</div>,
  };
});

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: () => <div data-testid="awx-error">error</div>,
}));

vi.mock('../../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({
    activePlatformUser: { is_superuser: true } as PlatformUser,
  }),
}));

type UseGetTeamResult = {
  data?: PlatformTeam;
  isLoading: boolean;
  error?: Error;
};

const { mockUseGet } = vi.hoisted(() => ({
  mockUseGet: vi.fn<(url: string | undefined) => UseGetTeamResult>(),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGet: (url: string | undefined) => mockUseGet(url),
  };
});

const mockTeam: PlatformTeam = {
  id: 7,
  name: 'EditMe',
  description: 'desc',
  url: gatewayAPI`/teams/7/`,
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 2, name: 'Org2' },
    resource: { ansible_id: 't', resource_type: 'team' },
  },
  organization: 2,
  users: [],
};

const teamGetUrl = gatewayAPI`/teams/7/`;

const server = setupServer(
  http.options(gatewayAPI`/teams/`, () =>
    HttpResponse.json({
      actions: {
        PUT: true,
        PATCH: true,
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/teams/7/edit']}>
      <Routes>
        <Route path="/teams/:id/edit" element={<EditPlatformTeam />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EditPlatformTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading while team is loading', () => {
    mockUseGet.mockReturnValue({ data: undefined, isLoading: true });
    renderEdit();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    expect(mockUseGet).toHaveBeenCalledWith(teamGetUrl);
  });

  it('renders edit form when team loads', async () => {
    mockUseGet.mockReturnValue({ data: mockTeam, isLoading: false });
    renderEdit();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit editme/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('EditMe');
  });

  it('renders PageNotFound when team is missing', () => {
    mockUseGet.mockReturnValue({ data: undefined, isLoading: false });
    renderEdit();
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
  });

  it('renders AwxError when team request errors', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    });
    renderEdit();
    expect(screen.getByTestId('awx-error')).toBeInTheDocument();
  });
});
