import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidebarHeader } from './SidebarHeader';

describe('SidebarHeader', () => {
  it('should render the title text', () => {
    render(<SidebarHeader title="Node Details" onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Node Details' })).toBeInTheDocument();
  });

  it('should render the close button', () => {
    render(<SidebarHeader title="Header" onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SidebarHeader title="Header" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should render ReactNode as title', () => {
    render(
      <SidebarHeader title={<span data-testid="custom-title">Custom</span>} onClose={vi.fn()} />
    );
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });
});
