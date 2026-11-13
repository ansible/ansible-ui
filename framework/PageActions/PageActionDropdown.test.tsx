import { ButtonVariant } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import {
  IPageAction,
  IPageActionSwitchSingle,
  PageActionSelection,
  PageActionType,
} from './PageAction';
import { filterActionSeperators, PageActionDropdown } from './PageActionDropdown';

type Item = { id: number; enabled: boolean };

describe('filterActionSeperators', () => {
  it('removes leading, trailing, and adjacent separators', () => {
    const action = {
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      label: 'Action',
      onClick: () => undefined,
    } satisfies IPageAction<object>;
    const separator = { type: PageActionType.Seperator } satisfies IPageAction<object>;

    expect(filterActionSeperators([separator, action, separator, separator, separator])).toEqual([
      action,
    ]);
    expect(filterActionSeperators([action, separator, separator, action])).toEqual([
      action,
      separator,
      action,
    ]);
  });

  it('removes separators from sparse action arrays', () => {
    const actions = [] as IPageAction<object>[];
    actions[1] = { type: PageActionType.Seperator } as IPageAction<object>;

    expect(filterActionSeperators(actions)).toEqual([]);
  });
});

describe('PageActionDropdown component', () => {
  const item: Item = { id: 2, enabled: true };

  it('shows disabled toggle when dropdown is disabled', () => {
    render(
      <MemoryRouter>
        <PageActionDropdown
          label="Actions"
          isDisabled="Disabled reason"
          actions={[
            {
              type: PageActionType.Button,
              selection: PageActionSelection.None,
              label: 'Hidden',
              onClick: vi.fn(),
            },
          ]}
        />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('runs actions and closes after selection', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpen = vi.fn();
    render(
      <MemoryRouter>
        <PageActionDropdown
          label="Actions"
          onOpen={onOpen}
          actions={[
            { type: PageActionType.Seperator },
            {
              type: PageActionType.Button,
              selection: PageActionSelection.Single,
              label: 'Edit',
              onClick,
              isDanger: true,
            },
            {
              type: PageActionType.Link,
              selection: PageActionSelection.Single,
              label: 'Open',
              href: (selected) => `/items/${selected.id}`,
            },
          ]}
          selectedItem={item}
          variant={ButtonVariant.primary}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'dropdown toggle' }));
    expect(onOpen).toHaveBeenCalledWith('Actions', true);
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onClick).toHaveBeenCalledWith(item);
    await waitFor(() =>
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument()
    );
  });

  it('renders switch and nested separator items', async () => {
    const user = userEvent.setup();
    const switchAction: IPageActionSwitchSingle<Item> = {
      type: PageActionType.Switch,
      selection: PageActionSelection.Single,
      label: 'Enable',
      isSwitchOn: (selected) => selected.enabled,
      onToggle: vi.fn(),
      ariaLabel: () => 'enable',
    };

    render(
      <MemoryRouter>
        <PageActionDropdown
          label="Rich"
          selectedItem={item}
          actions={[
            switchAction,
            { type: PageActionType.Seperator },
            { type: PageActionType.Seperator },
          ]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'dropdown toggle' }));
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders kebab menus and nested dropdown actions', async () => {
    const user = userEvent.setup();
    const nestedClick = vi.fn();
    render(
      <MemoryRouter>
        <PageActionDropdown
          actions={[
            {
              type: PageActionType.Button,
              selection: PageActionSelection.Multiple,
              label: 'Bulk delete',
              onClick: vi.fn(),
            },
            {
              type: PageActionType.Dropdown,
              selection: PageActionSelection.None,
              label: 'Nested',
              actions: [
                {
                  type: PageActionType.Button,
                  selection: PageActionSelection.None,
                  label: 'Nested action',
                  onClick: nestedClick,
                },
              ],
            },
          ]}
          selectedItems={[]}
          tooltip="Kebab tooltip"
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'kebab dropdown toggle' }));
    expect(screen.getByRole('menuitem', { name: 'Bulk delete' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByTestId('nested'));
    await user.click(await screen.findByRole('menuitem', { name: 'Nested action' }));
    expect(nestedClick).toHaveBeenCalled();
  });

  it('invokes multiple-selection and static link dropdown items', async () => {
    const user = userEvent.setup();
    const onBulk = vi.fn();
    render(
      <MemoryRouter>
        <PageActionDropdown
          label="Actions"
          actions={[
            {
              type: PageActionType.Button,
              selection: PageActionSelection.Multiple,
              label: 'Bulk edit',
              onClick: onBulk,
            },
            {
              type: PageActionType.Link,
              selection: PageActionSelection.None,
              label: 'Help',
              href: '/help',
            },
          ]}
          selectedItems={[{ id: 1 }, { id: 2 }]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'dropdown toggle' }));
    expect(screen.getByRole('menuitem', { name: 'Help' })).toHaveAttribute('href', '/help');
    await user.click(await screen.findByRole('menuitem', { name: 'Bulk edit' }));
    expect(onBulk).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it('shows tooltips for disabled and icon-only dropdown buttons', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PageActionDropdown
          label="Menu"
          actions={[
            {
              type: PageActionType.Button,
              selection: PageActionSelection.Multiple,
              label: 'Bulk',
              icon: CaretDownIcon,
              onClick: vi.fn(),
            },
          ]}
          selectedItems={[]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'dropdown toggle' }));
    const bulk = await screen.findByRole('menuitem', { name: 'Bulk' });
    expect(bulk).toHaveAttribute('aria-disabled', 'true');
    await user.hover(bulk);
    expect(await screen.findByText('Select at least one item from the list')).toBeInTheDocument();
  });
});
