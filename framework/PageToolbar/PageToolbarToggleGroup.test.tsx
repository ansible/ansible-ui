/* eslint-disable i18next/no-literal-string */
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterIcon } from '@patternfly/react-icons';
import { PageToolbarToggleGroup, PageToolbarToggleGroupContext } from './PageToolbarToggleGroup';

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

  it('should notify context when the group is expanded', async () => {
    const user = userEvent.setup();
    const setActiveGroup = vi.fn();

    render(
      <PageToolbarToggleGroupContext.Provider value={{ activeGroup: '', setActiveGroup }}>
        <Toolbar>
          <ToolbarContent>
            <PageToolbarToggleGroup id="filters-a" toggleIcon={<FilterIcon />} breakpoint="md">
              <ToolbarItem>
                <span>Filters A</span>
              </ToolbarItem>
            </PageToolbarToggleGroup>
          </ToolbarContent>
        </Toolbar>
      </PageToolbarToggleGroupContext.Provider>
    );

    const toggleGroup = screen.getByText('Filters A').closest('[class*="pf-m-toggle-group"]');
    const toggleButton = toggleGroup?.querySelector('button');
    expect(toggleButton).toBeTruthy();
    if (toggleButton) {
      await user.click(toggleButton);
    }

    expect(setActiveGroup).toHaveBeenCalledWith('filters-a');
  });

  it('should collapse when a different group is active in context', () => {
    render(
      <PageToolbarToggleGroupContext.Provider
        value={{ activeGroup: 'other-group', setActiveGroup: vi.fn() }}
      >
        <Toolbar>
          <ToolbarContent>
            <PageToolbarToggleGroup id="group-one" toggleIcon={<FilterIcon />} breakpoint="md">
              <ToolbarItem>
                <span>Group One</span>
              </ToolbarItem>
            </PageToolbarToggleGroup>
          </ToolbarContent>
        </Toolbar>
      </PageToolbarToggleGroupContext.Provider>
    );

    const toggleGroup = screen.getByText('Group One').closest('[class*="pf-m-toggle-group"]');
    expect(toggleGroup).not.toHaveClass('pf-m-show');
  });
});
