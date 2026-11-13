import { ButtonVariant } from '@patternfly/react-core';
import { Table } from '@patternfly/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CaretDownIcon } from '@patternfly/react-icons';
import {
  IPageActionButton,
  IPageActionLink,
  IPageActionLinkSingle,
  PageActionSelection,
  PageActionType,
} from './PageAction';
import { PageActionButton } from './PageActionButton';

type Item = { id: number };

describe('PageActionButton', () => {
  const item: Item = { id: 3 };

  it('invokes none, single, and multiple handlers', async () => {
    const user = userEvent.setup();
    const onNone = vi.fn();
    const onSingle = vi.fn();
    const onMultiple = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <PageActionButton
          action={{
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: 'Create',
            onClick: onNone,
          }}
        />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(onNone).toHaveBeenCalled();

    rerender(
      <MemoryRouter>
        <PageActionButton
          action={{
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            label: 'Edit',
            onClick: onSingle,
          }}
          selectedItem={item}
        />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onSingle).toHaveBeenCalledWith(item);

    rerender(
      <MemoryRouter>
        <PageActionButton
          action={{
            type: PageActionType.Button,
            selection: PageActionSelection.Multiple,
            label: 'Delete many',
            onClick: onMultiple,
            variant: ButtonVariant.primary,
            isDanger: true,
          }}
          selectedItems={[item]}
          isSecondary
        />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: 'Delete many' }));
    expect(onMultiple).toHaveBeenCalledWith([item]);
  });

  it('shows disabled tooltip content', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Table variant="compact">
          <PageActionButton
            action={{
              type: PageActionType.Button,
              selection: PageActionSelection.Multiple,
              label: 'Bulk',
              onClick: vi.fn(),
              tooltip: 'Bulk tooltip',
            }}
          />
        </Table>
      </MemoryRouter>
    );
    await user.hover(screen.getByRole('button', { name: 'Bulk' }));
    expect(await screen.findByText('Select at least one item from the list')).toBeInTheDocument();
  });

  it('renders icon-only and custom tooltips', async () => {
    const user = userEvent.setup();
    const action: IPageActionButton = {
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      label: 'Icon action',
      icon: CaretDownIcon,
      tooltip: 'Pick one',
      onClick: vi.fn(),
      isDisabled: () => 'Not allowed',
    };

    render(
      <MemoryRouter>
        <PageActionButton action={action} iconOnly />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: 'Icon action' });
    await user.hover(button);
    expect(await screen.findByText('Not allowed')).toBeInTheDocument();
  });

  it('renders router links for none and single selection', () => {
    const linkNone: IPageActionLink = {
      type: PageActionType.Link,
      selection: PageActionSelection.None,
      label: 'Home',
      href: '/home',
    };
    const linkSingle: IPageActionLinkSingle<Item> = {
      type: PageActionType.Link,
      selection: PageActionSelection.Single,
      label: 'View',
      href: (selected) => `/items/${selected.id}`,
    };

    const { rerender } = render(
      <MemoryRouter>
        <PageActionButton action={linkNone} isLink />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');

    rerender(
      <MemoryRouter>
        <PageActionButton action={linkSingle} selectedItem={item} isLink iconOnly />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/items/3');
  });
});
