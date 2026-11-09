/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BulkActionDialogProps } from '@ansible/ansible-ui-framework/PageDialogs/BulkActionDialog';
import type { PlatformRole } from '../../../interfaces/PlatformRole';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformTeamAssignRoles, type ResourceRolePair } from './PlatformTeamAssignRoles';

type AssignRolesBulkOpts = BulkActionDialogProps<ResourceRolePair>;

const { mockProgressDialog, mockPostRequest, mockPageNavigate } = vi.hoisted(() => ({
  mockProgressDialog: vi.fn<(opts: AssignRolesBulkOpts) => void | Promise<void>>(),
  mockPostRequest: vi.fn(() => Promise.resolve({})),
  mockPageNavigate: vi.fn(),
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
        resources: { id: string; name: string; namespace?: { id?: string } }[];
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
          data-testid="run-namespace-submit"
          onClick={() =>
            void props.onSubmit({
              resourceType: 'galaxy.containernamespace',
              resources: [{ id: '5', name: 'ns', namespace: { id: '777' } }],
              platformRoles: [{ id: 9, name: 'RoleA' } as PlatformRole],
            })
          }
        >
          namespace-submit
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
    useBulkActionDialog: () => mockProgressDialog,
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

const { mockTeamForAssign } = vi.hoisted(() => ({
  mockTeamForAssign: {
    id: 1,
    name: 'test-team',
    organization: 1,
    description: '',
    url: '/api/gateway/v1/teams/1/',
    created: '2025-08-12T16:21:29.389218Z',
    modified: '2025-08-12T16:21:29.389200Z',
  },
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: mockTeamForAssign, isLoading: false }),
}));

vi.mock('../../common/roles-wizard/PlatformSelectResourceTypeStep', () => ({
  PlatformSelectResourceTypeStep: () => (
    <div data-testid="resource-type-step">Resource Type Step</div>
  ),
}));
vi.mock('../../common/roles-wizard/PlatformSelectResourcesStep', () => ({
  PlatformSelectResourcesStep: () => <div data-testid="resources-step">Resources Step</div>,
}));
vi.mock('../../common/roles-wizard/PlatformSelectRolesStep', () => ({
  PlatformSelectRolesStep: () => <div data-testid="roles-step">Roles Step</div>,
}));
vi.mock('@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep', () => ({
  RoleAssignmentsReviewStep: () => <div data-testid="review-step">Review Step</div>,
}));

describe('PlatformTeamAssignRoles onSubmit', () => {
  afterEach(() => {
    cleanup();
    mockProgressDialog.mockReset();
    mockPostRequest.mockReset();
    mockPageNavigate.mockReset();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/access/teams/1/roles/assign']}>
        <Routes>
          <Route path="/access/teams/:id/roles/assign" element={<PlatformTeamAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('posts assignments with object_id for resources', async () => {
    mockProgressDialog.mockImplementation(async (opts: BulkActionDialogProps<ResourceRolePair>) => {
      await opts.actionFn(
        {
          resource: { id: '5', name: 'Res' },
          role: { id: 9, name: 'RoleA' } as PlatformRole,
        },
        new AbortController().signal
      );
      opts.onComplete?.([]);
    });

    renderComponent();

    await screen.findByTestId('run-wizard-submit').then((b) => b.click());

    await waitFor(() => expect(mockProgressDialog).toHaveBeenCalled());
    expect(mockPostRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_team_assignments/`,
      { team: mockTeamForAssign.id, role_definition: 9, object_id: '5' },
      expect.any(AbortSignal)
    );
  });

  it('uses namespace id for galaxy.containernamespace', async () => {
    mockProgressDialog.mockImplementation(async (opts: BulkActionDialogProps<ResourceRolePair>) => {
      await opts.actionFn(
        {
          resource: {
            id: '5',
            name: 'ns',
            namespace: { id: '777' },
          } as ResourceRolePair['resource'],
          role: { id: 9, name: 'RoleA' } as PlatformRole,
        },
        new AbortController().signal
      );
      opts.onComplete?.([]);
    });

    renderComponent();

    await screen.findByTestId('run-namespace-submit').then((b) => b.click());

    await waitFor(() => expect(mockPostRequest).toHaveBeenCalled());
    expect(mockPostRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_team_assignments/`,
      { team: mockTeamForAssign.id, role_definition: 9, object_id: '777' },
      expect.any(AbortSignal)
    );
  });

  it('posts system roles without object_id', async () => {
    mockProgressDialog.mockImplementation(async (opts: BulkActionDialogProps<ResourceRolePair>) => {
      await opts.actionFn(
        {
          resource: { id: '', name: '' },
          role: { id: 11, name: 'SysRole' } as PlatformRole,
        },
        new AbortController().signal
      );
      opts.onComplete?.([]);
      opts.onClose?.('success', [], [], []);
    });

    renderComponent();

    await screen.findByTestId('run-system-submit').then((b) => b.click());

    await waitFor(() => expect(mockPostRequest).toHaveBeenCalled());
    expect(mockPostRequest).toHaveBeenCalledWith(
      gatewayAPI`/role_team_assignments/`,
      { team: mockTeamForAssign.id, role_definition: 11 },
      expect.any(AbortSignal)
    );
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.TeamRoles, { params: { id: '1' } });
  });

  it('navigates away when assignment items resolve to empty', async () => {
    renderComponent();

    await screen.findByTestId('empty-submit').then((b) => b.click());

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.TeamRoles, { params: { id: '1' } });
  });

  it('wizard cancel navigates to team roles', async () => {
    renderComponent();

    await screen.findByTestId('run-cancel').then((b) => b.click());

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.TeamRoles, { params: { id: '1' } });
  });
});
