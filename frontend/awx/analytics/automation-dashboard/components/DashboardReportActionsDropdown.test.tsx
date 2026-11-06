import {
  IPageActionDropdown,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { IDashboardReportAction } from '../common/useAutomationDashboardToolbarActions';
import { IJobTemplate } from '../types';
import { DashboardReportActionsDropdown } from './DashboardReportActionsDropdown';

const CREATE_DESCRIPTION = 'Save the current filter set as a new report';
const UPDATE_DESCRIPTION = "Replace this report's saved filters with the current view";

const onCreate = vi.fn();
const onUpdate = vi.fn();
const onDelete = vi.fn();

function buildAction(
  disabled: { create?: string; update?: string; delete?: string } = {}
): IPageActionDropdown<IJobTemplate> {
  const createAction: IDashboardReportAction = {
    type: PageActionType.Button,
    selection: PageActionSelection.None,
    icon: PlusCircleIcon,
    label: 'Create new report',
    description: CREATE_DESCRIPTION,
    isDisabled: disabled.create,
    onClick: onCreate,
  };
  const updateAction: IDashboardReportAction = {
    type: PageActionType.Button,
    selection: PageActionSelection.None,
    icon: PencilAltIcon,
    label: 'Update report',
    description: UPDATE_DESCRIPTION,
    isDisabled: () => disabled.update,
    onClick: onUpdate,
  };
  return {
    type: PageActionType.Dropdown,
    selection: PageActionSelection.None,
    icon: PlusCircleIcon,
    label: 'Report actions',
    actions: [
      createAction,
      updateAction,
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: TrashIcon,
        label: 'Delete report',
        isDanger: true,
        isDisabled: disabled.delete,
        onClick: onDelete,
      },
    ],
  };
}

async function openMenu(action = buildAction()) {
  const user = userEvent.setup();
  render(<DashboardReportActionsDropdown action={action} />);
  await user.click(screen.getByRole('button', { name: 'Report actions' }));
  return { user, menu: await screen.findByRole('menu') };
}

function getItem(menu: HTMLElement, name: RegExp) {
  return within(menu).getByRole('menuitem', { name });
}

describe('DashboardReportActionsDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the toggle with the dropdown label and test id', () => {
    render(<DashboardReportActionsDropdown action={buildAction()} />);

    const toggle = screen.getByRole('button', { name: 'Report actions' });
    expect(toggle).toHaveAttribute('data-cy', 'report-actions');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('keeps the framework test ids on the menu items', async () => {
    const { menu } = await openMenu();

    expect(getItem(menu, /Create new report/).closest('li')).toHaveAttribute(
      'data-cy',
      'create-new-report'
    );
    expect(getItem(menu, /Update report/).closest('li')).toHaveAttribute(
      'data-cy',
      'update-report'
    );
    expect(getItem(menu, /Delete report/).closest('li')).toHaveAttribute(
      'data-cy',
      'delete-report'
    );
  });

  test('shows descriptions under enabled Create and Update items', async () => {
    const { menu } = await openMenu();

    expect(getItem(menu, /Create new report/)).toHaveTextContent(CREATE_DESCRIPTION);
    expect(getItem(menu, /Update report/)).toHaveTextContent(UPDATE_DESCRIPTION);
  });

  test('shows no description under Delete', async () => {
    const { menu } = await openMenu();

    expect(getItem(menu, /Delete report/)).toHaveTextContent(/^Delete report$/);
  });

  test('renders a divider directly before Delete', async () => {
    const { menu } = await openMenu();

    const children = Array.from(menu.children);
    const separatorIndex = children.findIndex((el) => el.getAttribute('role') === 'separator');
    expect(within(menu).getAllByRole('separator')).toHaveLength(1);
    expect(children[separatorIndex + 1]).toContainElement(getItem(menu, /Delete report/));
    expect(children[separatorIndex - 1]).toContainElement(getItem(menu, /Update report/));
  });

  test('hides the description and disables a disabled item', async () => {
    const { menu } = await openMenu(
      buildAction({ create: 'Modify filters before saving as a report', update: 'No update' })
    );

    const createItem = getItem(menu, /Create new report/);
    expect(createItem).toHaveAttribute('aria-disabled', 'true');
    expect(createItem).not.toHaveTextContent(CREATE_DESCRIPTION);
    const updateItem = getItem(menu, /Update report/);
    expect(updateItem).toHaveAttribute('aria-disabled', 'true');
    expect(updateItem).not.toHaveTextContent(UPDATE_DESCRIPTION);
  });

  test('shows the disabled reason as a tooltip on hover', async () => {
    const { user, menu } = await openMenu(
      buildAction({ create: 'Modify filters before saving as a report' })
    );

    await user.hover(getItem(menu, /Create new report/));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Modify filters before saving as a report'
    );
  });

  test('does not call onClick for a disabled item', async () => {
    const { user, menu } = await openMenu(buildAction({ delete: 'Only administrators' }));

    await user.click(getItem(menu, /Delete report/));

    expect(onDelete).not.toHaveBeenCalled();
  });

  test.each([
    [/Create new report/, onCreate],
    [/Update report/, onUpdate],
    [/Delete report/, onDelete],
  ])('calls the action and closes the menu when %s is clicked', async (name, onClick) => {
    const { user, menu } = await openMenu();

    await user.click(getItem(menu, name));

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
