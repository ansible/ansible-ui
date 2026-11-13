import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectResourcesStep } from './PlatformSelectResourcesStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(),
}));

vi.mock('@ansible/awx-ui/access/common/AwxRolesWizardSteps/AwxSelectResourcesStep', () => ({
  AwxSelectResourcesStep: ({ userOrTeamName }: { userOrTeamName: string }) => (
    <div data-testid="awx-resources">{userOrTeamName}</div>
  ),
}));

vi.mock('@ansible/eda-ui/access/common/EdaRolesWizardSteps/EdaSelectResourcesStep', () => ({
  EdaSelectResourcesStep: () => <div data-testid="eda-resources">eda</div>,
}));

vi.mock('@ansible/hub-ui/access/common/HubRoleWizardSteps/HubSelectResourcesStep', () => ({
  HubSelectResourcesStep: () => <div data-testid="hub-resources">hub</div>,
}));

import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';

const mockUsePageWizard = vi.mocked(usePageWizard);

describe('PlatformSelectResourcesStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when resourceType is not a string', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 12 },
    } as ReturnType<typeof usePageWizard>);

    const { container } = render(<PlatformSelectResourcesStep userOrTeamName="team-a" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders AWX step for awx resource types', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'awx.jobtemplate' },
    } as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectResourcesStep userOrTeamName="team-a" />);
    expect(screen.getByTestId('awx-resources')).toHaveTextContent('team-a');
  });

  it('renders EDA step for eda resource types', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'eda.project' },
    } as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectResourcesStep userOrTeamName="u" />);
    expect(screen.getByTestId('eda-resources')).toBeInTheDocument();
  });

  it('renders Hub step for galaxy resource types', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'galaxy.namespace' },
    } as ReturnType<typeof usePageWizard>);

    render(<PlatformSelectResourcesStep userOrTeamName="u" />);
    expect(screen.getByTestId('hub-resources')).toBeInTheDocument();
  });
});
