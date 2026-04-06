/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectRolesStep } from './PlatformSelectRolesStep';

// Track the queryParams passed to usePlatformMultiSelectListView
let capturedQueryParams: Record<string, string> = {};

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(),
}));

vi.mock('../../../common/usePlatformMultiSelectListView', () => ({
  usePlatformMultiSelectListView: vi.fn((options: { queryParams: Record<string, string> }) => {
    capturedQueryParams = options.queryParams;
    return {
      pageItems: [],
      itemCount: 0,
      selectedItems: [],
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
      isSelected: vi.fn(),
      selectItems: vi.fn(),
      unselectAll: vi.fn(),
      allSelected: false,
      keyFn: (item: { id: number }) => item.id,
      page: 1,
      perPage: 10,
      setPage: vi.fn(),
      setPerPage: vi.fn(),
      sort: undefined,
      setSort: vi.fn(),
      sortDirection: undefined,
      setSortDirection: vi.fn(),
      filterState: {},
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    };
  }),
}));

vi.mock('../../roles/hooks/usePlatformRolesFilters', () => ({
  usePlatformRolesFilters: vi.fn(() => []),
}));

vi.mock('@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep', () => ({
  SelectRolesStep: ({ descriptionForRoleSelection }: { descriptionForRoleSelection: string }) => (
    <div data-testid="select-roles-step">{descriptionForRoleSelection}</div>
  ),
}));

import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';

const mockUsePageWizard = vi.mocked(usePageWizard);

describe('PlatformSelectRolesStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQueryParams = {};
  });

  it('should filter roles by content_type__isnull when resourceType is system', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'system' },
      setWizardData: vi.fn(),
      stepData: {},
      setStepData: vi.fn(),
      activeStep: null,
      steps: [],
      visibleSteps: [],
    } as unknown as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectRolesStep />);

    expect(capturedQueryParams).toEqual({ content_type__isnull: 'true' });
    expect(capturedQueryParams).not.toHaveProperty('content_type__api_slug');
  });

  it('should filter roles by content_type__api_slug for non-system resource types', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'awx.jobtemplate' },
      setWizardData: vi.fn(),
      stepData: {},
      setStepData: vi.fn(),
      activeStep: null,
      steps: [],
      visibleSteps: [],
    } as unknown as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectRolesStep />);

    expect(capturedQueryParams).toEqual({ content_type__api_slug: 'awx.jobtemplate' });
    expect(capturedQueryParams).not.toHaveProperty('content_type__isnull');
  });

  it('should display system-level description when resourceType is system', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'system' },
      setWizardData: vi.fn(),
      stepData: {},
      setStepData: vi.fn(),
      activeStep: null,
      steps: [],
      visibleSteps: [],
    } as unknown as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectRolesStep />);

    expect(screen.getByText('Select system-level roles to apply.')).toBeInTheDocument();
  });

  it('should display resource-specific description for non-system types', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'awx.jobtemplate' },
      setWizardData: vi.fn(),
      stepData: {},
      setStepData: vi.fn(),
      activeStep: null,
      steps: [],
      visibleSteps: [],
    } as unknown as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectRolesStep />);

    expect(
      screen.getByText('Select roles to apply to all of your selected job templates.')
    ).toBeInTheDocument();
  });
});
