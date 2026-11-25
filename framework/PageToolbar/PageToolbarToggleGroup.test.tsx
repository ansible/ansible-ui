/* eslint-disable i18next/no-literal-string */
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
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

  it('should keep only the active context group expanded', async () => {
    const user = userEvent.setup();

    function TestToolbar() {
      const [activeGroup, setActiveGroup] = useState('');

      return (
        <PageToolbarToggleGroupContext.Provider value={{ activeGroup, setActiveGroup }}>
          <Toolbar>
            <ToolbarContent>
              <PageToolbarToggleGroup id="first-group" toggleIcon={<FilterIcon />} breakpoint="md">
                <ToolbarItem>
                  <span>First group</span>
                </ToolbarItem>
              </PageToolbarToggleGroup>
              <PageToolbarToggleGroup id="second-group" toggleIcon={<FilterIcon />} breakpoint="md">
                <ToolbarItem>
                  <span>Second group</span>
                </ToolbarItem>
              </PageToolbarToggleGroup>
            </ToolbarContent>
          </Toolbar>
          <span data-testid="active-group">{activeGroup}</span>
        </PageToolbarToggleGroupContext.Provider>
      );
    }

    render(<TestToolbar />);

    const [firstToggle, secondToggle] = screen.getAllByRole('button', { name: 'Show Filters' });

    await user.click(firstToggle);
    expect(screen.getByTestId('active-group')).toHaveTextContent('first-group');
    expect(firstToggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(secondToggle);
    expect(screen.getByTestId('active-group')).toHaveTextContent('second-group');
    expect(firstToggle).not.toHaveAttribute('aria-expanded', 'true');
    expect(secondToggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(secondToggle);
    expect(screen.getByTestId('active-group')).toBeEmptyDOMElement();
    expect(secondToggle).not.toHaveAttribute('aria-expanded', 'true');
  });
});
