import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PlatformTeam } from '../../../interfaces/PlatformTeam';
import type { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { CreatePlatformTeam, EditPlatformTeam } from './PlatformTeamForm';

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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

type UseGetResult = {
  data?: PlatformTeam;
  isLoading: boolean;
  error?: Error;
};

const mockUseGet = vi.fn<(url: string | undefined) => UseGetResult>();

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGet: (url: string | undefined) => mockUseGet(url),
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: {} } }),
}));

vi.mock('../../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({
    activePlatformUser: { is_superuser: false } as PlatformUser,
  }),
}));

const server = setupServer(
  http.options(gatewayAPI`/teams/`, () => HttpResponse.json({ actions: { POST: {} } }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

const team: PlatformTeam = {
  id: 3,
  name: 'BranchTeam',
  description: '',
  url: gatewayAPI`/teams/3/`,
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 2, name: 'Org' },
    resource: { ansible_id: 't', resource_type: 'team' },
  },
  organization: 2,
  users: [],
};

describe('EditPlatformTeam branches', () => {
  function renderEdit() {
    return render(
      <MemoryRouter initialEntries={['/teams/3/edit']}>
        <Routes>
          <Route path="/teams/:id/edit" element={<EditPlatformTeam />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('shows loading', () => {
    mockUseGet.mockReturnValue({ isLoading: true });
    renderEdit();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('shows error', () => {
    mockUseGet.mockReturnValue({ isLoading: false, error: new Error('x') });
    renderEdit();
    expect(screen.getByTestId('awx-error')).toBeInTheDocument();
  });

  it('shows not found when team missing', () => {
    mockUseGet.mockReturnValue({ isLoading: false, data: undefined });
    renderEdit();
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
  });

  it('uses team name in the page title', async () => {
    mockUseGet.mockReturnValue({ isLoading: false, data: team });
    renderEdit();
    expect(await screen.findByTestId('page-title')).toHaveTextContent('BranchTeam');
  });

  it('uses Teams fallback in title and breadcrumbs when team name is missing', async () => {
    mockUseGet.mockReturnValue({ isLoading: false, data: { ...team, name: '' } });
    renderEdit();
    const title = await screen.findByTestId('page-title');
    expect(title).toHaveTextContent('Teams');
    expect(title).not.toHaveTextContent('Edit');
  });
});

describe('CreatePlatformTeam cancel', () => {
  it('navigates back on cancel', async () => {
    const user = userEvent.setup();
    mockNavigate.mockClear();

    render(
      <MemoryRouter initialEntries={['/teams/create']}>
        <Routes>
          <Route path="/teams/create" element={<CreatePlatformTeam />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
