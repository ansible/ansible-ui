import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { CreatePlatformTeam, EditPlatformTeam } from './PlatformTeamForm';

const mockPostRequest = vi.fn(() =>
  Promise.resolve({
    id: 42,
  } as PlatformTeam)
);
const mockPatchRequest = vi.fn(() => Promise.resolve());

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: () => mockPostRequest,
}));
vi.mock('@ansible/common-ui/crud/usePatchRequest', () => ({
  usePatchRequest: () => mockPatchRequest,
}));

const mockPageNavigate = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: { POST: {}, PUT: {} } } }),
}));

vi.mock('../../../common/PlatformPageForm', () => ({
  PlatformPageForm: (
    props: Readonly<{
      onSubmit: (team: PlatformTeam) => Promise<void>;
      defaultValue?: PlatformTeam;
      submitText: string;
      children?: React.ReactNode;
    }>
  ) => (
    <div>
      <button
        type="button"
        onClick={() =>
          void props.onSubmit(
            props.defaultValue ??
              ({
                name: 'N',
                description: '',
                organization: 1,
              } as PlatformTeam)
          )
        }
      >
        {props.submitText}
      </button>
    </div>
  ),
}));

type UseGetReturn = {
  data: PlatformTeam | undefined;
  isLoading: boolean;
  error?: Error;
};

const mockUseGet = vi.fn<(url: string | undefined) => UseGetReturn>();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url: string | undefined) => mockUseGet(url),
}));

const editTeam: PlatformTeam = {
  id: 7,
  name: 'EditMe',
  description: 'd',
  url: gatewayAPI`/teams/7/`,
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

describe('PlatformTeamForm submit handlers', () => {
  it('CreatePlatformTeam posts then navigates to team details', async () => {
    const user = userEvent.setup();
    mockPostRequest.mockClear();
    mockPageNavigate.mockClear();

    render(
      <MemoryRouter>
        <CreatePlatformTeam />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /create team/i }));

    expect(mockPostRequest).toHaveBeenCalledWith(gatewayAPI`/teams/`, expect.any(Object));
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.TeamDetails, {
      params: { id: 42 },
    });
  });

  it('EditPlatformTeam patches then navigates back', async () => {
    const user = userEvent.setup();
    mockUseGet.mockReturnValue({ data: editTeam, isLoading: false });
    mockPatchRequest.mockClear();
    mockNavigate.mockClear();

    render(
      <MemoryRouter initialEntries={['/teams/7/edit']}>
        <Routes>
          <Route path="/teams/:id/edit" element={<EditPlatformTeam />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /save team/i }));

    expect(mockPatchRequest).toHaveBeenCalledWith(gatewayAPI`/teams/7/`, editTeam);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
