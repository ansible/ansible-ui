import { DropdownItem } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PageMastheadDropdown } from './PageMastheadDropdown';

vi.mock('../components/useBreakPoint', () => ({
  useBreakpoint: vi.fn(() => true),
}));

import { useBreakpoint } from '../components/useBreakPoint';

describe('PageMastheadDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBreakpoint).mockReturnValue(true);
  });

  test('should render the toggle button', () => {
    render(
      <PageMastheadDropdown id="test-dropdown" icon={<span>icon</span>}>
        <DropdownItem key="item1">Item 1</DropdownItem>
      </PageMastheadDropdown>
    );

    expect(screen.getByRole('button')).toBeDefined();
  });

  test('should open the dropdown when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PageMastheadDropdown id="test-dropdown" icon={<span>icon</span>}>
        <DropdownItem key="item1">Item 1</DropdownItem>
      </PageMastheadDropdown>
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  test('should close the dropdown when an item is selected', async () => {
    const user = userEvent.setup();
    render(
      <PageMastheadDropdown id="test-dropdown" icon={<span>icon</span>}>
        <DropdownItem key="item1">Item 1</DropdownItem>
      </PageMastheadDropdown>
    );

    const toggle = screen.getByRole('button');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByText('Item 1'));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('should display the label on larger screens', () => {
    vi.mocked(useBreakpoint).mockReturnValue(true);
    render(
      <PageMastheadDropdown id="test-dropdown" icon={<span>icon</span>} label="Help">
        <DropdownItem key="item1">Item 1</DropdownItem>
      </PageMastheadDropdown>
    );
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  test('should hide the label on smaller screens', () => {
    vi.mocked(useBreakpoint).mockReturnValue(false);
    render(
      <PageMastheadDropdown id="test-dropdown" icon={<span>icon</span>} label="Help">
        <DropdownItem key="item1">Item 1</DropdownItem>
      </PageMastheadDropdown>
    );
    expect(screen.queryByText('Help')).toBeNull();
  });

  test('should display a tooltip on hover when the tooltip prop is provided', async () => {
    const user = userEvent.setup();
    render(
      <PageMastheadDropdown id="test-dropdown" icon={<span>icon</span>} tooltip="Open help menu">
        <DropdownItem key="item1">Item 1</DropdownItem>
      </PageMastheadDropdown>
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Open help menu');
  });
});
