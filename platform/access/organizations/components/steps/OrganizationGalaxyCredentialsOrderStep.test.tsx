import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { OrganizationGalaxyCredentialsOrderStep } from './OrganizationGalaxyCredentialsOrderStep';

vi.mock('@ansible/ansible-ui-framework/components/ReorderItems', () => ({
  ReorderItems: (props: {
    items: { name: string }[];
    setItems: (items: { name: string }[]) => void;
    columns: { header: string; cell: (item: { name: string }) => string }[];
  }) => (
    <div>
      <button
        type="button"
        data-testid="mock-reorder-swap"
        onClick={() => props.setItems([props.items[1], props.items[0]])}
      >
        swap order
      </button>
      {props.items.map((item) => (
        <span key={item.name} data-testid={`row-${item.name}`}>
          {props.columns[0]?.cell(item)}
        </span>
      ))}
    </div>
  ),
}));

const wizardState: {
  wizardData: Record<string, unknown>;
  setWizardData: ReturnType<typeof vi.fn>;
  setStepData: ReturnType<typeof vi.fn>;
} = {
  wizardData: {},
  setWizardData: vi.fn(),
  setStepData: vi.fn(),
};

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => wizardState,
}));

describe('OrganizationGalaxyCredentialsOrderStep', () => {
  it('renders heading and credential names', () => {
    const credA = { id: 1, name: 'Cred A', credential_type: 1 } as Credential;
    const credB = { id: 2, name: 'Cred B', credential_type: 1 } as Credential;
    wizardState.wizardData = { galaxyCredentials: [credA, credB] };
    wizardState.setWizardData = vi.fn();
    wizardState.setStepData = vi.fn();

    render(<OrganizationGalaxyCredentialsOrderStep />);

    expect(screen.getByText('Manage galaxy credential order')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The order of these credentials determines the priority for searching and synchronizing content. Use the draggable icon on the left to re-order your galaxy credentials.'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('row-Cred A')).toHaveTextContent('Cred A');
    expect(screen.getByTestId('row-Cred B')).toHaveTextContent('Cred B');
  });

  it('updates wizard data and step mapping when items are reordered', async () => {
    const credA = { id: 1, name: 'Cred A', credential_type: 1 } as Credential;
    const credB = { id: 2, name: 'Cred B', credential_type: 1 } as Credential;
    wizardState.wizardData = { galaxyCredentials: [credA, credB], other: 'keep' };
    wizardState.setWizardData = vi.fn();
    wizardState.setStepData = vi.fn();

    const user = userEvent.setup();
    render(<OrganizationGalaxyCredentialsOrderStep />);

    await user.click(screen.getByTestId('mock-reorder-swap'));

    expect(wizardState.setWizardData).toHaveBeenCalledWith({
      galaxyCredentials: [credB, credA],
      other: 'keep',
    });
    expect(wizardState.setStepData).toHaveBeenCalledWith(expect.any(Function));
    const updater = wizardState.setStepData.mock.calls[0][0] as (
      prev: Record<string, unknown>
    ) => Record<string, unknown>;
    expect(updater({})).toEqual({ mapping: { mappings: [credB, credA] } });
  });
});
