import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyCell } from './CopyCell';

const mockWriteToClipboard = vi.fn();

vi.mock('../hooks/useClipboard', () => ({
  useClipboard: () => ({
    writeToClipboard: mockWriteToClipboard,
  }),
}));

describe('CopyCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render text content', () => {
    render(<CopyCell text="Copy this text" />);
    expect(screen.getByText('Copy this text')).toBeInTheDocument();
  });

  it('should render empty when no text provided', () => {
    const { container } = render(<CopyCell />);
    expect(container.textContent).toBe('');
  });

  it('should render empty when text is undefined', () => {
    const { container } = render(<CopyCell text={undefined} />);
    expect(container.textContent).toBe('');
  });

  it('should have clipboard copy component', () => {
    render(<CopyCell text="Text" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call writeToClipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<CopyCell text="Copy me" />);

    const copyButton = screen.getByRole('button');
    await user.click(copyButton);

    expect(mockWriteToClipboard).toHaveBeenCalledWith('Copy me');
  });

  it('should render with custom testId', () => {
    render(<CopyCell text="Text" testId="custom-copy" />);
    expect(screen.getByTestId('custom-copy')).toBeInTheDocument();
  });

  it('should have hover tip for copy', () => {
    render(<CopyCell text="Text" />);
    const copyButton = screen.getByRole('button');
    expect(copyButton).toHaveAttribute('aria-label', 'Copy to clipboard');
  });

  it('should handle empty string text', () => {
    const { container } = render(<CopyCell text="" />);
    expect(container.textContent).toBe('');
  });
});
