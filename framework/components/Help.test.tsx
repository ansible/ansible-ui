import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Help } from './Help';

describe('Help', () => {
  it('renders nothing when help content is absent', () => {
    const { container } = render(<Help title="Title" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens popover help and documentation link', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <Help title="Field help" help={['Line one', 'Line two']} docLink="https://docs.example.com" />
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Line one')).toBeInTheDocument();
    expect(screen.getByText('Line two')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Documentation' }));
    expect(open).toHaveBeenCalledWith('https://docs.example.com', '_blank');

    open.mockRestore();
  });
});
