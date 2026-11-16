import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectOrganizationRolesStep } from './PlatformSelectOrganizationRolesStep';

let capturedOptions: { queryParams?: Record<string, unknown>; url?: string } = {};

vi.mock('../../../common/usePlatformMultiSelectListView', () => ({
  usePlatformMultiSelectListView: vi.fn((options: typeof capturedOptions) => {
    capturedOptions = options;
    return { pageItems: [], itemCount: 0 };
  }),
}));

vi.mock('../../roles/hooks/usePlatformRolesFilters', () => ({
  usePlatformRolesFilters: () => [],
}));

vi.mock('../../roles/hooks/usePlatformRoleColumns', () => ({
  usePlatformRoleColumns: () => [],
}));

vi.mock('@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep', () => ({
  SelectRolesStep: (props: { title?: string; descriptionForRoleSelection?: string }) => (
    <div data-testid="select-roles-step">
      <span>{props.title}</span>
      <span>{props.descriptionForRoleSelection}</span>
    </div>
  ),
}));

describe('PlatformSelectOrganizationRolesStep', () => {
  beforeEach(() => {
    capturedOptions = {};
  });

  it('queries organization roles and renders step copy', () => {
    render(
      <PlatformSelectOrganizationRolesStep
        fieldNameForPreviousStep="teams"
        excludeRoles={['Member']}
      />
    );

    expect(capturedOptions.queryParams).toEqual({
      content_type__api_slug: 'shared.organization',
      not__name__contains: ['Member'],
    });
    expect(screen.getByText('Select organization roles')).toBeInTheDocument();
    expect(screen.getByText(/Select the organization roles/)).toBeInTheDocument();
  });
});
