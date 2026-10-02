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
