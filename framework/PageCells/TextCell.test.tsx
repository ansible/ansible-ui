/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TextCell } from './TextCell';

const TestIcon = () => <span data-testid="test-icon">Icon</span>;

describe('TextCell', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  describe('text rendering', () => {
    it('should render text', () => {
      renderWithRouter(<TextCell text="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render empty when no text provided', () => {
      const { container } = renderWithRouter(<TextCell />);
      expect(container.querySelector('[data-testid]')).not.toBeInTheDocument();
    });

    it('should render null text as empty', () => {
      const { container } = renderWithRouter(<TextCell text={null} />);
      expect(container.querySelector('[data-testid]')).not.toBeInTheDocument();
    });

    it('should add data-testid based on text', () => {
      renderWithRouter(<TextCell text="Success" />);
      expect(screen.getByTestId('success-status')).toBeInTheDocument();
    });
  });

  describe('icon rendering', () => {
    it('should render icon on the left by default', () => {
      renderWithRouter(<TextCell text="Text" icon={<TestIcon />} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render icon on the right when iconAlign is right', () => {
      renderWithRouter(<TextCell text="Text" icon={<TestIcon />} iconAlign="right" />);
      // Icon should be rendered
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      // Text should also be rendered
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should render icon without text', () => {
      renderWithRouter(<TextCell icon={<TestIcon />} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('link behavior', () => {
    it('should render as link when "to" is provided', () => {
      renderWithRouter(<TextCell text="Link Text" to="/some/path" />);
      const link = screen.getByRole('link', { name: 'Link Text' });
      expect(link).toHaveAttribute('href', '/some/path');
    });

    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderWithRouter(<TextCell text="Click Me" onClick={onClick} />);
      await user.click(screen.getByText('Click Me'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not render link when disableLinks is true', () => {
      renderWithRouter(<TextCell text="Text" to="/path" disableLinks />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should prioritize onClick over navigation', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderWithRouter(<TextCell text="Click" to="/path" onClick={onClick} />);
      await user.click(screen.getByText('Click'));

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should apply maxWidth style', () => {
      renderWithRouter(<TextCell text="Text" maxWidth={200} />);
      const textDiv = screen.getByText('Text').closest('div');
      expect(textDiv).toHaveStyle({ maxWidth: '200px' });
    });

    it('should have ellipsis overflow styles', () => {
      renderWithRouter(<TextCell text="Long text content" />);
      const textDiv = screen.getByText('Long text content').closest('div');
      expect(textDiv).toHaveStyle({
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      });
    });
  });
});
