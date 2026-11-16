import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectRolesStep } from './PlatformSelectRolesStep';

let capturedQueryParams: Record<string, string> = {};

vi.mock('../../../common/usePlatformMultiSelectListView', () => ({
  usePlatformMultiSelectListView: vi.fn((options: { queryParams: Record<string, string> }) => {
    capturedQueryParams = options.queryParams;
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

describe('PlatformSelectRolesStep (organization wizard)', () => {
  beforeEach(() => {
    capturedQueryParams = {};
  });

  it('passes roleType to query params when provided', () => {
    render(
      <PlatformSelectRolesStep
        roleType="shared.team"
        title="Team roles"
        descriptionForRoleSelection="Pick team roles"
      />
    );

    expect(capturedQueryParams).toEqual({ content_type__api_slug: 'shared.team' });
    expect(screen.getByText('Team roles')).toBeInTheDocument();
    expect(screen.getByText('Pick team roles')).toBeInTheDocument();
  });

  it('omits slug filter when roleType is not set', () => {
    render(<PlatformSelectRolesStep title="All roles" />);
    expect(capturedQueryParams).toEqual({});
  });
});
