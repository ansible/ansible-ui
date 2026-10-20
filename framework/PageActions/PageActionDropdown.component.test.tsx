import { ButtonVariant } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionSelection, PageActionType } from './PageAction';
import { PageActionDropdown } from './PageActionDropdown';

const action: IPageAction<object> = {
  type: PageActionType.Button,
  selection: PageActionSelection.None,
  label: 'Run action',
  onClick: vi.fn(),
};

describe('PageActionDropdown menu toggle', () => {
  it('uses the kebab label when there is no label or icon', () => {
    render(<PageActionDropdown actions={[action]} />);

    expect(screen.getByRole('button', { name: 'kebab dropdown toggle' })).toBeInTheDocument();
  });

  it('uses the dropdown label when a visible label is provided', () => {
    render(<PageActionDropdown actions={[action]} label="Actions" />);

    expect(screen.getByRole('button', { name: 'dropdown toggle' })).toBeInTheDocument();
  });

  it('lets an explicit aria label override the default', () => {
    render(<PageActionDropdown actions={[action]} ariaLabel="More page actions" />);

    expect(screen.getByRole('button', { name: 'More page actions' })).toBeInTheDocument();
  });

  it('uses the secondary variant for a primary action toggle when non-bulk items are selected', () => {
    render(
      <PageActionDropdown actions={[action]} selectedItems={[{}]} variant={ButtonVariant.primary} />
    );

    expect(screen.getByRole('button', { name: 'kebab dropdown toggle' })).toHaveClass(
      'pf-m-secondary'
    );
  });

  it('keeps the primary variant when selected items have bulk actions', () => {
    const bulkAction: IPageAction<object> = {
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      label: 'Run for selected items',
      onClick: vi.fn(),
    };

    render(
      <PageActionDropdown
        actions={[bulkAction]}
        selectedItems={[{}]}
        variant={ButtonVariant.primary}
      />
    );

    expect(screen.getByRole('button', { name: 'kebab dropdown toggle' })).toHaveClass(
      'pf-m-primary'
    );
  });
});
