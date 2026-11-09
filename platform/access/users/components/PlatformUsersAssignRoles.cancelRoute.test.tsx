import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformUsersAssignRoles } from './PlatformUsersAssignRoles';

const { mockProgressDialog, mockPageNavigate } = vi.hoisted(() => ({
  mockProgressDialog: vi.fn(),
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
    PageWizard: (props: { onCancel?: () => void }) => (
      <button type="button" data-testid="run-cancel-custom" onClick={() => props.onCancel?.()}>
        cancel
      </button>
    ),
    useGetPageUrl: () => () => '',
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({
    data: {
      id: 1,
      username: 'test-user',
      url: '/api/gateway/v1/users/1/',
      created: '',
      modified: '',
    },
    isLoading: false,
  }),
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

describe('PlatformUsersAssignRoles custom userRolesRoute', () => {
  it('onCancel navigates using userRolesRoute prop', async () => {
    mockPageNavigate.mockReset();

    render(
      <MemoryRouter initialEntries={['/access/users/1/roles/assign']}>
        <Routes>
          <Route
            path="/access/users/:id/roles/assign"
            element={<PlatformUsersAssignRoles userRolesRoute={PlatformRoute.UserDetails} />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId('run-cancel-custom').then((b) => b.click());

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.UserDetails, {
      params: { id: '1' },
    });
  });
});
