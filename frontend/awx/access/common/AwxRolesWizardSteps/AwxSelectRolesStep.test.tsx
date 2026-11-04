import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AwxSelectRolesStep } from './AwxSelectRolesStep';

const mockView = { selectedItems: [], pageItems: [] };
const wizardState = vi.hoisted(() => ({ resourceType: 'awx.credential' as string }));

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

vi.mock('@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep', () => ({
  SelectRolesStep: (props: { descriptionForRoleSelection?: string; title?: string }) => (
    <div>
      <span data-testid="role-description">{props.descriptionForRoleSelection}</span>
      <span data-testid="role-title">{props.title}</span>
    </div>
  ),
}));

describe('AwxSelectRolesStep', () => {
  beforeEach(() => {
    wizardState.resourceType = 'awx.credential';
  });

  it('shows credential-specific role selection description', () => {
    render(<AwxSelectRolesStep />);
    expect(screen.getByTestId('role-description')).toHaveTextContent(
      'Select roles to apply to all of your selected credentials.'
    );
  });

  it('shows project-specific role selection description', () => {
    wizardState.resourceType = 'awx.project';
    render(<AwxSelectRolesStep />);
    expect(screen.getByTestId('role-description')).toHaveTextContent(
      'Select roles to apply to all of your selected projects.'
    );
  });

  it('shows default description for unknown resource types', () => {
    wizardState.resourceType = 'awx.unknown';
    render(<AwxSelectRolesStep />);
    expect(screen.getByTestId('role-description')).toHaveTextContent(
      'Select roles to apply to all of your selected resources.'
    );
  });

  it('uses explicit title prop', () => {
    render(<AwxSelectRolesStep title="Pick roles" contentType="organization" />);
    expect(screen.getByTestId('role-title')).toHaveTextContent('Pick roles');
  });

  it('shows inventory-specific role selection description', () => {
    wizardState.resourceType = 'awx.inventory';
    render(<AwxSelectRolesStep />);
    expect(screen.getByTestId('role-description')).toHaveTextContent(
      'Select roles to apply to all of your selected inventories.'
    );
  });

  it('uses contentType prop when resource type is absent', () => {
    wizardState.resourceType = '';
    render(<AwxSelectRolesStep contentType="team" title="Team roles" />);
    expect(screen.getByTestId('role-title')).toHaveTextContent('Team roles');
  });
});
