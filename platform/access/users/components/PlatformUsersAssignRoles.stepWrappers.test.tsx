import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformUsersAssignRoles } from './PlatformUsersAssignRoles';

type WizardStep = {
  id?: string;
  validate?: (formData: object, context: unknown) => void;
};

const { capturedSteps } = vi.hoisted(() => ({
  capturedSteps: { current: null as WizardStep[] | null },
}));

vi.mock('@ansible/awx-ui/common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageWizard: (props: { steps: WizardStep[] }) => {
      capturedSteps.current = props.steps;
      return null;
    },
    useGetPageUrl: () => () => '',
    usePageNavigate: () => vi.fn(),
  };
});

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({
    data: {
      id: 1,
      username: 'u',
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

describe('PlatformUsersAssignRoles wizard step validate wrappers', () => {
  it('delegates validate callbacks', () => {
    render(
      <MemoryRouter initialEntries={['/access/users/1/roles/assign']}>
        <Routes>
          <Route path="/access/users/:id/roles/assign" element={<PlatformUsersAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );

    const steps = capturedSteps.current;
    expect(steps).not.toBeNull();
    const resourcesStep = steps?.find((s) => s.id === 'resources');
    const rolesStep = steps?.find((s) => s.id === 'roles');

    expect(() => resourcesStep?.validate?.({}, undefined)).toThrow('Select at least one resource.');
    expect(() => rolesStep?.validate?.({}, undefined)).toThrow('Select at least one role.');
  });
});
