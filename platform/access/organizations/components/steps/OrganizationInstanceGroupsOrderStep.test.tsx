import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { OrganizationInstanceGroupsOrderStep } from './OrganizationInstanceGroupsOrderStep';

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

describe('OrganizationInstanceGroupsOrderStep', () => {
  it('renders heading and instance group names', () => {
    const igA = { id: 1, name: 'Group A' } as InstanceGroup;
    const igB = { id: 2, name: 'Group B' } as InstanceGroup;
    wizardState.wizardData = { instanceGroups: [igA, igB] };
    wizardState.setWizardData = vi.fn((next: Record<string, unknown>) => {
      wizardState.wizardData = next;
    });
    wizardState.setStepData = vi.fn();

    render(<OrganizationInstanceGroupsOrderStep />);

    expect(screen.getByText('Manage instance groups order')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The execution precedence is determined by the order in which these instance groups are listed. Use the draggable icon on the left to re-order your instance groups.'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('row-Group A')).toHaveTextContent('Group A');
    expect(screen.getByTestId('row-Group B')).toHaveTextContent('Group B');
  });

  it('updates wizard data and step mapping when items are reordered', async () => {
    const igA = { id: 1, name: 'Group A' } as InstanceGroup;
    const igB = { id: 2, name: 'Group B' } as InstanceGroup;
    wizardState.wizardData = { instanceGroups: [igA, igB], other: 'keep' };
    wizardState.setWizardData = vi.fn();
    wizardState.setStepData = vi.fn();

    const user = userEvent.setup();
    render(<OrganizationInstanceGroupsOrderStep />);

    await user.click(screen.getByTestId('mock-reorder-swap'));

    expect(wizardState.setWizardData).toHaveBeenCalledWith({
      instanceGroups: [igB, igA],
      other: 'keep',
    });
    expect(wizardState.setStepData).toHaveBeenCalledWith(expect.any(Function));
    const updater = wizardState.setStepData.mock.calls[0][0] as (
      prev: Record<string, unknown>
    ) => Record<string, unknown>;
    expect(updater({})).toEqual({ mapping: { mappings: [igB, igA] } });
  });
});
