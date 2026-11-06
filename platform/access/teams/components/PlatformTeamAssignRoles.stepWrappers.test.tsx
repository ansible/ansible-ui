import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformTeamAssignRoles } from './PlatformTeamAssignRoles';

const mockTeam = {
  id: 1,
  name: 'test-team',
  organization: 1,
  description: '',
  url: '/api/gateway/v1/teams/1/',
  created: '2025-08-12T16:21:29.389218Z',
  modified: '2025-08-12T16:21:29.389200Z',
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: mockTeam, isLoading: false }),
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

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageWizard: (props: {
      steps: Array<{
        id?: string;
        validate?: (formData: object, context: unknown) => void;
      }>;
    }) => {
      const resourcesStep = props.steps.find((s) => s.id === 'resources');
      const rolesStep = props.steps.find((s) => s.id === 'roles');

      expect(() => resourcesStep?.validate?.({}, undefined)).toThrow(
        'Select at least one resource.'
      );
      expect(() => rolesStep?.validate?.({}, undefined)).toThrow('Select at least one role.');

      return null;
    },
    useBulkActionDialog: () => vi.fn(),
  };
});

describe('PlatformTeamAssignRoles wizard step wrappers', () => {
  it('delegates validate props to validateTeamAssign* helpers', () => {
    render(
      <MemoryRouter initialEntries={['/access/teams/1/roles/assign']}>
        <Routes>
          <Route path="/access/teams/:id/roles/assign" element={<PlatformTeamAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );
  });
});
