import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectRolesStep } from './PlatformSelectRolesStep';

let capturedQueryParams: Record<string, string> = {};

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(),
}));

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
  SelectRolesStep: (props: { title?: string }) => (
    <div data-testid="select-roles-step">{props.title ?? 'roles'}</div>
  ),
}));

import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';

const mockUsePageWizard = vi.mocked(usePageWizard);

describe('PlatformSelectRolesStep (organizations)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQueryParams = {};
  });

  it('derives content_type slug from wizard resourceType when contentType prop is omitted', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'awx.jobtemplate' },
    } as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectRolesStep fieldNameForPreviousStep="users" title="Pick roles" />);

    expect(capturedQueryParams).toEqual({ content_type__api_slug: 'jobtemplate' });
    expect(screen.getByText('Pick roles')).toBeInTheDocument();
  });

  it('uses explicit contentType prop when provided', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'awx.jobtemplate' },
    } as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectRolesStep contentType="shared.organization" title="Org roles" />);

    expect(capturedQueryParams).toEqual({ content_type__api_slug: 'shared.organization' });
  });
});
