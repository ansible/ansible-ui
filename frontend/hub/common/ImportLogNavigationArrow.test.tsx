import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavigationArrow } from './ImportLogNavigationArrow';

describe('NavigationArrow', () => {
  it('calls onClick when the up arrow is clicked or activated with Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavigationArrow direction="up" onClick={onClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('fa-arrow-circle-up');
    expect(button).toHaveAttribute('tabindex', '0');

    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders a down arrow that can be activated with Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavigationArrow direction="down" onClick={onClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('fa-arrow-circle-down');
    expect(button).toHaveAttribute('tabindex', '1');

    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
