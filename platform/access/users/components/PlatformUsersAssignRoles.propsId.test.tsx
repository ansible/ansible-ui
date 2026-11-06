/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformUsersAssignRoles } from './PlatformUsersAssignRoles';

vi.mock('@ansible/awx-ui/common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => vi.fn(),
}));

const mockUseGet =
  vi.fn<
    (
      url: unknown,
      ...rest: unknown[]
    ) => { data: { id: number; username: string }; isLoading: boolean }
  >();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url: unknown, ...rest: unknown[]) => mockUseGet(url, ...rest),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageWizard: () => null,
    useGetPageUrl: () => () => '',
    usePageNavigate: () => vi.fn(),
  };
});

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

describe('PlatformUsersAssignRoles id resolution', () => {
  it('prefers id prop over route param for user fetch', () => {
    mockUseGet.mockReturnValue({ data: { id: 2, username: 'u' }, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/access/users/9/roles/assign']}>
        <Routes>
          <Route
            path="/access/users/:id/roles/assign"
            element={<PlatformUsersAssignRoles id="2" />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(mockUseGet).toHaveBeenCalledWith(gatewayAPI`/users/2/`);
  });
});
