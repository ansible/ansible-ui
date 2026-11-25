import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AwxSelectResourcesStep } from './AwxSelectResourcesStep';

const wizardState = vi.hoisted(() => ({
  resourceType: 'awx.project' as string,
  useAwxMultiSelectListView: vi.fn<
    (options: { url?: string }, field: string) => { selectedItems: never[]; pageItems: never[] }
  >(() => ({ selectedItems: [], pageItems: [] })),
}));

vi.mock('../../../common/useAwxMultiSelectListView', () => ({
  useAwxMultiSelectListView: wizardState.useAwxMultiSelectListView,
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: wizardState.resourceType },
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
    wizardState.useAwxMultiSelectListView.mockClear();
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

  it('uses the selected resource type endpoint', () => {
    wizardState.resourceType = 'awx.inventory';
    render(<AwxSelectResourcesStep userOrTeamName="Alex" />);

    expect(screen.getByRole('heading', { name: 'Select inventories' })).toBeInTheDocument();
    const viewCall = wizardState.useAwxMultiSelectListView.mock.calls.at(-1);
    expect(viewCall?.[0]?.url).toContain('/inventories/');
    expect(viewCall?.[1]).toBe('resources');
  });

  it('does not configure an endpoint for an unknown resource type', () => {
    wizardState.resourceType = 'awx.unknown';
    render(<AwxSelectResourcesStep userOrTeamName="Alex" />);

    const viewCall = wizardState.useAwxMultiSelectListView.mock.calls.at(-1);
    expect(viewCall?.[0]?.url).toBeUndefined();
  });
});
