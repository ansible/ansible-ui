import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AwxSelectResourcesStep } from './AwxSelectResourcesStep';

const mockView = { selectedItems: [], pageItems: [] };
const wizardState = vi.hoisted(() => ({ resourceType: 'awx.project' as string }));

vi.mock('../../../common/useAwxMultiSelectListView', () => ({
  useAwxMultiSelectListView: () => mockView,
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: wizardState,
    stepData: {},
    activeStep: null,
  }),
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => <div data-testid="resource-list" />,
}));

describe('AwxSelectResourcesStep', () => {
  beforeEach(() => {
    wizardState.resourceType = 'awx.project';
  });

  it('shows project resource title and helper text', () => {
    render(<AwxSelectResourcesStep userOrTeamName="Alice" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Select projects');
    expect(
      screen.getByText(/Choose the resources that you want Alice to have/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('resource-list')).toBeInTheDocument();
  });

  it('uses execution environment filters when resource type is EE', () => {
    wizardState.resourceType = 'awx.executionenvironment';
    render(<AwxSelectResourcesStep userOrTeamName="Team A" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Select execution environments'
    );
  });
});
