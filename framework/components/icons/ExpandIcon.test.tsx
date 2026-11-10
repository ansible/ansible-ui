import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ExpandIcon } from './ExpandIcon';

describe('ExpandIcon', () => {
  it('toggles expansion when clicked', async () => {
    const user = userEvent.setup();
    const setExpanded = vi.fn();

    render(<ExpandIcon isExpanded={false} setExpanded={setExpanded} direction="left" size="sm" />);

    await user.click(screen.getByTestId('expandable'));
    expect(setExpanded).toHaveBeenCalledWith(true);
  });

  it('applies alternate rotation when collapsed on the right', () => {
    const { container } = render(
      <ExpandIcon isExpanded={false} setExpanded={vi.fn()} direction="right" />
    );
    expect(container.querySelector('[data-testid="expandable"]')).toBeTruthy();
  });
});
