import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Ansi } from './Ansi';

describe('Ansi', () => {
  it('should render plain text input', () => {
    render(<Ansi input="hello world" />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('should render ansi-colored segments as separate spans', () => {
    const input = `\x1b[31merror\x1b[0m`;
    const { container } = render(<Ansi input={input} />);
    const coloredSpan = screen.getByText('error');
    expect(coloredSpan).toHaveClass('ansi-red-fg');
    expect(container.querySelectorAll('span').length).toBeGreaterThanOrEqual(1);
  });
});
