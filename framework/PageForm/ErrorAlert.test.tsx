/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ErrorAlert } from './ErrorAlert';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        Errors: 'Errors',
        Error: 'Error',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ErrorAlert', () => {
  test('renders string error correctly', () => {
    const error = 'An error occurred';
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(error)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Danger alert: An error occurred/i })
    ).toBeInTheDocument();
  });

  test('renders ReactNode error correctly', () => {
    const error = <span>Error as ReactNode</span>;
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Error as ReactNode')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Danger alert: Error/i })).toBeInTheDocument();
  });

  test('does not render when error is null', () => {
    render(<ErrorAlert error={null} isMd={true} onCancel={() => {}} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('does not render when error is undefined', () => {
    render(<ErrorAlert error={undefined} isMd={true} onCancel={() => {}} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('does not render when error is empty string', () => {
    render(<ErrorAlert error="" isMd={true} onCancel={() => {}} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('displays single error from array without expansion', () => {
    const error = ['Single error message'];
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Single error message')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /alert details/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Danger alert: Single error message/i })
    ).toBeInTheDocument();
  });

  test('displays expandable alert for multiple errors', () => {
    const errors = ['Error one', 'Error two', 'Error three'];
    render(<ErrorAlert error={errors} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('pf-m-expandable');
    expect(screen.getByRole('heading', { name: /Danger alert: Errors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alert details/i })).toBeInTheDocument();
  });

  test('expands to show all errors when toggle is clicked', async () => {
    const user = userEvent.setup();
    const errors = ['Error one', 'Error two', 'Error three'];
    render(<ErrorAlert error={errors} isMd={true} onCancel={() => {}} />);

    const toggleButton = screen.getByRole('button', { name: /alert details/i });
    await user.click(toggleButton);

    expect(screen.getByText('Error one')).toBeInTheDocument();
    expect(screen.getByText('Error two')).toBeInTheDocument();
    expect(screen.getByText('Error three')).toBeInTheDocument();

    // Check that errors are displayed in a list
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  test('applies correct styling when isMd is true and onCancel is provided', () => {
    const error = 'An error occurred';
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ paddingLeft: '24px' });
  });

  test('does not apply padding when isMd is false', () => {
    const error = 'An error occurred';
    render(<ErrorAlert error={error} isMd={false} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveStyle({ paddingLeft: '24px' });
  });

  test('does not apply padding when onCancel is not provided', () => {
    const error = 'An error occurred';
    render(<ErrorAlert error={error} isMd={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveStyle({ paddingLeft: '24px' });
  });

  test('renders danger variant alert', () => {
    const error = 'An error occurred';
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('pf-m-danger');
  });

  test('renders inline alert', () => {
    const error = 'An error occurred';
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('pf-m-inline');
  });

  test('handles mixed array of strings and ReactNodes', async () => {
    const user = userEvent.setup();
    const errors = [
      'String error',
      <span key="react-node">ReactNode error</span>,
      'Another string error',
    ];
    render(<ErrorAlert error={errors} isMd={true} onCancel={() => {}} />);

    const toggleButton = screen.getByRole('button', { name: /alert details/i });
    await user.click(toggleButton);

    expect(screen.getByText('String error')).toBeInTheDocument();
    expect(screen.getByText('ReactNode error')).toBeInTheDocument();
    expect(screen.getByText('Another string error')).toBeInTheDocument();
  });

  test('handles empty array', () => {
    render(<ErrorAlert error={[]} isMd={true} onCancel={() => {}} />);

    // Empty array is truthy, so it renders with title "Error"
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Danger alert: Error/i })).toBeInTheDocument();
  });

  test('handles array with empty string', () => {
    const errors = [''];
    render(<ErrorAlert error={errors} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Danger alert:/i })).toBeInTheDocument();
  });

  test('handles complex ReactNode error', () => {
    const error = (
      <div>
        <strong>Complex error:</strong>
        <p>This is a detailed error message with multiple elements.</p>
      </div>
    );
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Complex error:')).toBeInTheDocument();
    expect(
      screen.getByText('This is a detailed error message with multiple elements.')
    ).toBeInTheDocument();
  });

  test('does not show expandable content for single ReactNode error', () => {
    const error = <span>Single ReactNode error</span>;
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /alert details/i })).not.toBeInTheDocument();
    expect(screen.getByText('Single ReactNode error')).toBeInTheDocument();
  });

  test('maintains proper accessibility with heading structure', () => {
    const error = 'Accessible error message';
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    const heading = screen.getByRole('heading', {
      name: /Danger alert: Accessible error message/i,
    });
    expect(alert).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  test('maintains proper accessibility for expandable alerts', async () => {
    const user = userEvent.setup();
    const errors = ['Error one', 'Error two'];
    render(<ErrorAlert error={errors} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    const toggleButton = screen.getByRole('button', { name: /alert details/i });
    const heading = screen.getByRole('heading', { name: /Danger alert: Errors/i });

    expect(alert).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  test('ErrorContent component handles string errors by returning null', () => {
    const error = 'String error should not render content';
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    const description = alert?.querySelector('.pf-v6-c-alert__description');
    expect(alert).toBeInTheDocument();
    expect(description).toBeEmptyDOMElement();
  });

  test('ErrorContent component handles single array item by returning null', () => {
    const error = ['Single item should not render content'];
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    const description = alert?.querySelector('.pf-v6-c-alert__description');
    expect(alert).toBeInTheDocument();
    expect(description).toBeEmptyDOMElement();
  });

  test('ErrorContent component renders React element directly', () => {
    const error = <strong>React element content</strong>;
    render(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('React element content')).toBeInTheDocument();
  });
});
