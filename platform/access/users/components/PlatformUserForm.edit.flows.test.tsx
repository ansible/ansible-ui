import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import type { IUserInput } from './PlatformUserForm';

const {
  mockPostRequest,
  mockPatchUser,
  mockGetRequest,
  mockDeleteRequest,
  mockPageNavigate,
  mockNavigate,
  mockAlertToaster,
  mockAwxErrorAdapter,
  baseUser,
  mockPlatformUser,
  mockOrgHelpers,
  mockOrganizationMemberRoles,
  mockUserOrganizations,
} = vi.hoisted(() => {
  const user: PlatformUser = {
    id: 7,
    url: '/api/gateway/v1/users/7/',
    username: 'edit-me',
    email: 'e@x.com',
    first_name: 'Ed',
    last_name: 'It',
    is_superuser: false,
    is_platform_auditor: false,
    created: '',
    created_by: '',
    modified: '',
    modified_by: '',
    related: {},
    summary_fields: {
      modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
      created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
      resource: { ansible_id: 'x', resource_type: 'user' },
    },
    last_login_map_results: [],
    managed: false,
  };

  const orgState: {
    orgIds: number[];
    getAddedAndRemovedOrganizationIds: (orgs: number[]) => {
      addedOrganizationIds: number[];
      removedOrganizationIds: number[];
    };
  } = {
    orgIds: [],
    getAddedAndRemovedOrganizationIds: () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [],
    }),
  };

  const platformUser = { ...user };

  return {
    mockPostRequest: vi.fn(() => Promise.resolve({})),
    mockPatchUser: vi.fn(() => Promise.resolve({})),
    mockGetRequest: vi.fn(),
    mockDeleteRequest: vi.fn(() => Promise.resolve({})),
    mockPageNavigate: vi.fn(),
    mockNavigate: vi.fn(),
    mockAlertToaster: { addAlert: vi.fn() },
    mockAwxErrorAdapter: vi.fn((_err?: unknown) => ({
      genericErrors: [] as { message: string }[],
      fieldErrors: [] as { message: string }[],
    })),
    baseUser: user,
    mockPlatformUser: platformUser,
    mockOrgHelpers: orgState,
    mockOrganizationMemberRoles: [{ id: 600 }] as { id: number }[],
    mockUserOrganizations: [{ id: 10, name: 'Org' }] as { id: number; name: string }[],
  };
});

vi.mock('../hooks/useGetPlatformUsers', () => ({
  useGetPlatformUsers: () => ({ platformUser: mockPlatformUser, isLoading: false }),
}));

vi.mock('../hooks/useGetOrganizationsForUser', () => ({
  useGetOrganizationsForUser: () => mockOrgHelpers,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">loading</div>,
    PageNotFound: () => <div data-testid="page-not-found">not found</div>,
    usePageNavigate: () => mockPageNavigate,
    usePageAlertToaster: () => mockAlertToaster,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/usePatchRequest', () => ({
  usePatchRequest: () => mockPatchUser,
}));
vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    postRequest: mockPostRequest,
  };
});
vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGet: (url: string | undefined, qs?: { name?: string }) => {
      if (qs?.name === 'Platform Auditor') {
        return { data: { results: [{ id: 500 }] }, isLoading: false };
      }
      if (qs?.name === 'Organization Member') {
        return { data: { results: mockOrganizationMemberRoles }, isLoading: false };
      }
      if (String(url).includes('/organizations/')) {
        return {
          data: { results: mockUserOrganizations },
          isLoading: false,
        };
      }
      return { data: undefined, isLoading: false };
    },
    useGetRequest: () => mockGetRequest,
  };
});
vi.mock('@ansible/common-ui/crud/useDeleteRequest', () => ({
  useDeleteRequest: () => mockDeleteRequest,
}));
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: {} } }),
}));

vi.mock('@ansible/awx-ui/common/adapters/awxErrorAdapter', () => ({
  awxErrorAdapter: (err: unknown) => mockAwxErrorAdapter(err),
}));

vi.mock('../../../common/PlatformPageForm', () => ({
  PlatformPageForm: (props: {
    defaultValue?: Partial<IUserInput>;
    onSubmit: (
      values: IUserInput,
      setError: (name: string, err: unknown) => void,
      setFieldError: (name: string, err: { message: string }) => void
    ) => Promise<boolean | void>;
    onCancel?: () => void;
  }) => (
    <div>
      <button
        type="button"
        data-testid="edit-mismatch"
        onClick={() => {
          const setFieldError = vi.fn();
          void props
            .onSubmit(
              {
                ...props.defaultValue,
                username: 'edit-me',
                password: 'a',
                confirmPassword: 'b',
                organizations: [],
                userType: 'normal',
              } as IUserInput,
              vi.fn(),
              setFieldError
            )
            .then(() => {
              expect(setFieldError).toHaveBeenCalledWith(
                'confirmPassword',
                expect.objectContaining({ message: 'Password does not match.' })
              );
            });
        }}
      >
        pwd-mismatch
      </button>
      <button
        type="button"
        data-testid="become-auditor"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              userType: 'auditor',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        auditor
      </button>
      <button
        type="button"
        data-testid="remove-auditor"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              userType: 'normal',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        normal
      </button>
      <button
        type="button"
        data-testid="org-add-fail"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              organizations: [1],
              userType: 'normal',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        org-add-fail
      </button>
      <button
        type="button"
        data-testid="org-remove-fail"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              organizations: [],
              userType: 'normal',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        org-remove-fail
      </button>
      <button
        type="button"
        data-testid="org-remove-success"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              organizations: [],
              userType: 'normal',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        org-remove-success
      </button>
      <button
        type="button"
        data-testid="superuser-org-fail"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              userType: 'admin',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        superuser-org-fail
      </button>
      <button
        type="button"
        data-testid="superuser-org-strip"
        onClick={() =>
          void props.onSubmit(
            {
              ...props.defaultValue,
              username: 'edit-me',
              userType: 'admin',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        superuser-strip
      </button>
      <button type="button" data-testid="edit-cancel" onClick={() => props.onCancel?.()}>
        cancel
      </button>
    </div>
  ),
}));

import { EditPlatformUser } from './PlatformUserForm';

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/users/7/edit']}>
      <Routes>
        <Route path="/users/:id/edit" element={<EditPlatformUser />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EditPlatformUser submit branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAwxErrorAdapter.mockReturnValue({
      genericErrors: [{ message: 'gen' }],
      fieldErrors: [{ message: 'fld' }],
    });
    Object.assign(mockPlatformUser, baseUser);
    mockOrganizationMemberRoles.length = 0;
    mockOrganizationMemberRoles.push({ id: 600 });
    mockUserOrganizations.length = 0;
    mockUserOrganizations.push({ id: 10, name: 'Org' });
    mockOrgHelpers.orgIds = [];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [],
    });
    mockGetRequest.mockImplementation((_url, params: Record<string, string | number>) => {
      if (String(params.role_definition) === '500') {
        return Promise.resolve({ results: [{ id: 999 }] });
      }
      if (String(params.role_definition) === '600') {
        const assignmentIdByOrg: Record<string, number> = { '11': 888, '10': 889 };
        const objectId = params.object_id !== undefined ? String(params.object_id) : '';
        const id = assignmentIdByOrg[objectId] ?? 888;
        return Promise.resolve({ results: [{ id }] });
      }
      return Promise.resolve({ results: [] });
    });
  });

  it('blocks password change when confirmation does not match', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('edit-mismatch'));
    expect(mockPatchUser).not.toHaveBeenCalled();
  });

  it('assigns platform auditor when switching to auditor', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('become-auditor'));
    expect(mockPostRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      user: 7,
      role_definition: 500,
      object_id: null,
    });
    expect(mockPatchUser).toHaveBeenCalled();
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.UserDetails, { params: { id: 7 } });
  });

  it('removes platform auditor assignment when switching to normal', async () => {
    Object.assign(mockPlatformUser, baseUser, { is_platform_auditor: true });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('remove-auditor'));
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/999/`);
    expect(mockPatchUser).toHaveBeenCalled();
  });

  it('toasts when adding organization membership fails', async () => {
    mockOrgHelpers.orgIds = [];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [10],
      removedOrganizationIds: [],
    });
    mockPostRequest.mockRejectedValueOnce(new Error('x'));
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-add-fail'));
    expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to associate organization with id: 10.',
      })
    );
    const addArg = mockAlertToaster.addAlert.mock.calls[0][0] as {
      children: ReactNode;
    };
    expect(addArg.children).toBeTruthy();
  });

  it('toasts when removing organization membership fails', async () => {
    mockOrgHelpers.orgIds = [11];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11],
    });
    mockGetRequest.mockImplementationOnce(() => Promise.reject(new Error('x')));
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-fail'));
    expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to disassociate organization with id: 11.',
      })
    );
    const removeArg = mockAlertToaster.addAlert.mock.calls[0][0] as {
      children: ReactNode;
    };
    expect(removeArg.children).toBeTruthy();
  });

  it('toasts when superuser org cleanup fails', async () => {
    Object.assign(mockPlatformUser, baseUser, { is_superuser: true });
    mockGetRequest.mockRejectedValueOnce(new Error('x'));
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('superuser-org-fail'));
    expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to disassociate organization with id: 10.',
      })
    );
    const superuserRemoveArg = mockAlertToaster.addAlert.mock.calls[0][0] as {
      children: ReactNode;
    };
    expect(superuserRemoveArg.children).toBeTruthy();
  });

  it('navigates back on cancel', async () => {
    const user = userEvent.setup();
    mockNavigate.mockReset();
    renderEdit();
    await user.click(screen.getByTestId('edit-cancel'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('uses an empty role definition filter when Organization Member role is unavailable', async () => {
    mockOrganizationMemberRoles.length = 0;
    mockOrgHelpers.orgIds = [11];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11],
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-success'));
    expect(mockGetRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      expect.objectContaining({
        role_definition: '',
        object_id: 11,
      })
    );
  });

  it('skips delete when org member assignment lookup returns no results', async () => {
    mockOrgHelpers.orgIds = [11];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11],
    });
    mockGetRequest.mockImplementation((_url, params: Record<string, string | number>) => {
      if (String(params.role_definition) === '600') {
        return Promise.resolve({});
      }
      return Promise.resolve({ results: [{ id: 999 }] });
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-success'));
    expect(mockDeleteRequest).not.toHaveBeenCalled();
  });

  it('removes org membership for non-superuser when removal succeeds', async () => {
    mockOrgHelpers.orgIds = [11];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11],
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-success'));
    expect(mockGetRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      expect.objectContaining({
        user: 7,
        object_id: 11,
        role_definition: 600,
        content_type__api_slug: 'shared.organization',
      })
    );
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/888/`);
  });

  it('removes multiple organizations in parallel when several are dropped', async () => {
    mockOrgHelpers.orgIds = [11, 12];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11, 12],
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-success'));
    expect(mockGetRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      expect.objectContaining({ object_id: 11 })
    );
    expect(mockGetRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      expect.objectContaining({ object_id: 12 })
    );
    expect(mockDeleteRequest).toHaveBeenCalledTimes(2);
  });

  it('skips delete when no org member assignments match the filter', async () => {
    mockOrgHelpers.orgIds = [11];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11],
    });
    mockGetRequest.mockImplementation((_url, params: Record<string, string | number>) => {
      if (String(params.role_definition) === '600') {
        return Promise.resolve({ results: [] });
      }
      return Promise.resolve({ results: [{ id: 999 }] });
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-success'));
    expect(mockDeleteRequest).not.toHaveBeenCalled();
  });

  it('deletes every matching org member assignment when several are returned', async () => {
    mockOrgHelpers.orgIds = [11];
    mockOrgHelpers.getAddedAndRemovedOrganizationIds = () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [11],
    });
    mockGetRequest.mockImplementation((_url, params: Record<string, string | number>) => {
      if (String(params.role_definition) === '500') {
        return Promise.resolve({ results: [{ id: 999 }] });
      }
      if (String(params.role_definition) === '600' && String(params.object_id) === '11') {
        return Promise.resolve({ results: [{ id: 801 }, { id: 802 }] });
      }
      return Promise.resolve({ results: [] });
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('org-remove-success'));
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/801/`);
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/802/`);
  });

  it('skips org cleanup when saving as superuser with no organizations', async () => {
    Object.assign(mockPlatformUser, baseUser, { is_superuser: true });
    mockUserOrganizations.length = 0;
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('superuser-org-strip'));
    expect(mockGetRequest).not.toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      expect.objectContaining({ content_type__api_slug: 'shared.organization' })
    );
    expect(mockPatchUser).toHaveBeenCalled();
  });

  it('strips org memberships when saving as superuser', async () => {
    Object.assign(mockPlatformUser, baseUser, { is_superuser: true });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('superuser-org-strip'));
    expect(mockGetRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      expect.objectContaining({
        user: 7,
        object_id: 10,
        role_definition: 600,
        content_type__api_slug: 'shared.organization',
      })
    );
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/889/`);
  });

  it('deletes every org member assignment for superuser when several exist', async () => {
    Object.assign(mockPlatformUser, baseUser, { is_superuser: true });
    mockGetRequest.mockImplementation((_url, params: Record<string, string | number>) => {
      if (String(params.role_definition) === '500') {
        return Promise.resolve({ results: [{ id: 999 }] });
      }
      if (String(params.role_definition) === '600' && String(params.object_id) === '10') {
        return Promise.resolve({ results: [{ id: 901 }, { id: 902 }] });
      }
      return Promise.resolve({ results: [] });
    });
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByTestId('superuser-org-strip'));
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/901/`);
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/902/`);
  });
});
