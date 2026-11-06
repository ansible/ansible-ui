/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BulkActionDialogProps } from '@ansible/ansible-ui-framework/PageDialogs/BulkActionDialog';
import type { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformUsersAssignRoles } from './PlatformUsersAssignRoles';

type AssignRolesBulkOpts = BulkActionDialogProps<{
  resource: { id: string; name: string; pulp_href?: string };
  role: PlatformRole;
}>;

const { mockProgressDialog, mockPostRequest, mockPageNavigate } = vi.hoisted(() => ({
  mockProgressDialog: vi.fn<(opts: AssignRolesBulkOpts) => void | Promise<void>>(),
  mockPostRequest: vi.fn(() => Promise.resolve({})),
  mockPageNavigate: vi.fn(),
}));

vi.mock('@ansible/awx-ui/common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => mockProgressDialog,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageWizard: (props: {
      onSubmit: (data: {
        resourceType: string;
        resources: { id: string; name: string }[];
        platformRoles: PlatformRole[];
      }) => Promise<void>;
      onCancel?: () => void;
    }) => (
      <div>
        <button
          type="button"
          data-testid="run-wizard-submit"
          onClick={() =>
            void props.onSubmit({
              resourceType: 'awx.project',
              resources: [{ id: '5', name: 'Res' }],
              platformRoles: [{ id: 9, name: 'RoleA' } as PlatformRole],
            })
          }
        >
          run-submit
        </button>
        <button
          type="button"
          data-testid="run-system-submit"
          onClick={() =>
            void props.onSubmit({
              resourceType: 'system',
              resources: [],
              platformRoles: [{ id: 11, name: 'SysRole' } as PlatformRole],
            })
          }
        >
          system-submit
        </button>
        <button
          type="button"
          data-testid="empty-submit"
          onClick={() =>
            void props.onSubmit({
              resourceType: 'awx.project',
              resources: [],
              platformRoles: [],
            })
          }
        >
          empty-submit
        </button>
        <button type="button" data-testid="run-cancel" onClick={() => props.onCancel?.()}>
          cancel
        </button>
      </div>
    ),
    useGetPageUrl: () => () => '',
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    postRequest: mockPostRequest,
  };
});

const { mockUserForAssign } = vi.hoisted(() => ({
  mockUserForAssign: {
    id: 1,
    username: 'test-user',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    url: '/api/gateway/v1/users/1/',
    created: '2025-08-12T16:21:29.389218Z',
    modified: '2025-08-12T16:21:29.389200Z',
  },
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: mockUserForAssign, isLoading: false }),
}));

vi.mock('../../common/roles-wizard/PlatformSelectResourceTypeStep', () => ({
  PlatformSelectResourceTypeStep: () => null,
}));
vi.mock('../../common/roles-wizard/PlatformSelectResourcesStep', () => ({
  PlatformSelectResourcesStep: () => null,
}));
vi.mock('../../common/roles-wizard/PlatformSelectRolesStep', () => ({
  PlatformSelectRolesStep: () => null,
}));
vi.mock('@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep', () => ({
  RoleAssignmentsReviewStep: () => null,
}));

describe('PlatformUsersAssignRoles onSubmit', () => {
  afterEach(() => {
    cleanup();
    mockProgressDialog.mockReset();
    mockPostRequest.mockReset();
    mockPageNavigate.mockReset();
  });

  const renderRoute = () =>
    render(
      <MemoryRouter initialEntries={['/access/users/1/roles/assign']}>
        <Routes>
          <Route path="/access/users/:id/roles/assign" element={<PlatformUsersAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );

  it('posts role_user_assignments with object_id and content_type for resource roles', async () => {
    mockProgressDialog.mockImplementation(async (opts: AssignRolesBulkOpts) => {
      await opts.actionFn(
        {
          resource: { id: '5', name: 'Res' },
          role: { id: 9, name: 'RoleA' } as PlatformRole,
        },
        new AbortController().signal
      );
      opts.onComplete?.([]);
    });

    renderRoute();

    await screen.findByTestId('run-wizard-submit').then((b) => b.click());

    await waitFor(() => expect(mockPostRequest).toHaveBeenCalled());
    expect(mockPostRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      {
        user: mockUserForAssign.id,
        role_definition: 9,
        object_id: '5',
        content_type: 'awx.project',
      },
      expect.any(AbortSignal)
    );
  });

  it('posts system roles without object_id or content_type', async () => {
    mockProgressDialog.mockImplementation(async (opts: AssignRolesBulkOpts) => {
      await opts.actionFn(
        {
          resource: { id: '', name: '' },
          role: { id: 11, name: 'SysRole' } as PlatformRole,
        },
        new AbortController().signal
      );
      opts.onComplete?.([]);
    });

    renderRoute();

    await screen.findByTestId('run-system-submit').then((b) => b.click());

    await waitFor(() => expect(mockPostRequest).toHaveBeenCalled());
    expect(mockPostRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_user_assignments/`,
      { user: mockUserForAssign.id, role_definition: 11 },
      expect.any(AbortSignal)
    );
  });

  it('navigates to user roles when assignment items resolve to empty', async () => {
    renderRoute();

    await screen.findByTestId('empty-submit').then((b) => b.click());

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.UserRoles, { params: { id: '1' } });
  });

  it('wizard cancel navigates to user roles', async () => {
    renderRoute();

    await screen.findByTestId('run-cancel').then((b) => b.click());

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.UserRoles, { params: { id: '1' } });
  });
});
