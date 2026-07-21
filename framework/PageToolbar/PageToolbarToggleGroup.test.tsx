/* eslint-disable i18next/no-literal-string */
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FilterIcon } from '@patternfly/react-icons';
import { PageToolbarToggleGroup } from './PageToolbarToggleGroup';

describe('PageToolbarToggleGroup', () => {
  it('should render children within toggle group', () => {
    render(
      <Toolbar>
        <ToolbarContent>
          <PageToolbarToggleGroup id="test-group" toggleIcon={<FilterIcon />} breakpoint="md">
            <ToolbarItem>
              <span>Child Content</span>
            </ToolbarItem>
          </PageToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render with PF6 class names used by CRC CSS override', () => {
    const { container } = render(
      <Toolbar className="page-table-toolbar">
        <ToolbarContent>
          <PageToolbarToggleGroup id="test-group" toggleIcon={<FilterIcon />} breakpoint="md">
            <ToolbarItem>
              <span>Filter Widget</span>
            </ToolbarItem>
          </PageToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    );

    const toolbar = container.querySelector('.page-table-toolbar');
    expect(toolbar).toBeInTheDocument();

    const toggleGroup = toolbar?.querySelector('.pf-v6-c-toolbar__group.pf-m-toggle-group');
    expect(toggleGroup).toBeInTheDocument();

    const toolbarItem = toggleGroup?.querySelector('.pf-v6-c-toolbar__item');
    expect(toolbarItem).toBeInTheDocument();

    const toggle = toggleGroup?.querySelector('.pf-v6-c-toolbar__toggle');
    expect(toggle).toBeInTheDocument();
  });

  it('should toggle expanded state when clicked', async () => {
    const user = userEvent.setup();

    render(
      <Toolbar>
        <ToolbarContent>
          <PageToolbarToggleGroup id="test-group" toggleIcon={<FilterIcon />} breakpoint="md">
            <ToolbarItem>
              <span>Toggle Content</span>
            </ToolbarItem>
          </PageToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    );

    const toggleGroup = screen.getByText('Toggle Content').closest('[class*="pf-m-toggle-group"]');
    expect(toggleGroup).toBeInTheDocument();

    const toggleButton = toggleGroup?.querySelector('button.pf-v6-c-toolbar__toggle');
    if (toggleButton) {
      await user.click(toggleButton);
      expect(toggleGroup).toHaveClass('pf-m-show');
    }
  });
});
