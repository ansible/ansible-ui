import { ButtonVariant } from '@patternfly/react-core';
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
import { PageActionPinned, PageActionsPinned } from './PageActionsPinned';

type Item = { id: number; enabled: boolean };
const item: Item = { id: 1, enabled: true };

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('PageActionsPinned', () => {
  it('renders nothing when there are no actions', () => {
    const { container } = renderWithRouter(<PageActionsPinned actions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders pinned buttons, links, switches, and dropdown actions', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onToggle = vi.fn();
    const onOpen = vi.fn();
    const onDropdownClick = vi.fn();

    const switchAction: IPageActionSwitchSingle<Item> = {
      type: PageActionType.Switch,
      selection: PageActionSelection.Single,
      label: 'Enable',
      isSwitchOn: (selected) => selected.enabled,
      onToggle,
      ariaLabel: () => 'enabled',
    };

    const actions: IPageAction<Item>[] = [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: 'Edit',
        onClick,
      },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        label: 'Details',
        href: (selected) => `/items/${selected.id}`,
      },
      switchAction,
      {
        type: PageActionType.Dropdown,
        selection: PageActionSelection.None,
        label: 'More',
        tooltip: 'More options',
        variant: ButtonVariant.secondary,
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: 'Extra',
            onClick: onDropdownClick,
          },
        ],
      },
    ];

    renderWithRouter(
      <PageActionsPinned actions={actions} selectedItem={item} onOpen={onOpen} iconOnly />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onClick).toHaveBeenCalledWith(item);
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '/items/1');

    const switchToggle = document.querySelector('span.pf-v6-c-switch__toggle');
    if (switchToggle) await user.click(switchToggle);
    expect(onToggle).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'dropdown toggle' }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledWith('More', true));
    await user.click(await screen.findByRole('menuitem', { name: 'Extra' }));
    expect(onDropdownClick).toHaveBeenCalled();
  });

  it('uses disabled tooltip when a pinned dropdown is blocked', () => {
    const actions: IPageAction<Item>[] = [
      {
        type: PageActionType.Dropdown,
        selection: PageActionSelection.Single,
        label: 'Blocked menu',
        isDisabled: () => 'Cannot open',
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: 'Never shown',
            onClick: vi.fn(),
          },
        ],
      },
    ];

    renderWithRouter(<PageActionsPinned actions={actions} selectedItem={item} />);
    expect(screen.getByRole('button', { name: 'Blocked menu' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('skips separator pinned actions', () => {
    renderWithRouter(<PageActionPinned action={{ type: PageActionType.Seperator }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
