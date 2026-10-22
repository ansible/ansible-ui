import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DashboardSectionHeading } from './DashboardSectionHeading';

describe('DashboardSectionHeading', () => {
  test('should render the title as a heading', () => {
    render(<DashboardSectionHeading title="Automation streak" />);

    expect(screen.getByRole('heading', { name: 'Automation streak' })).toBeInTheDocument();
  });

  test('should not render a help button when no help text is given', () => {
    render(<DashboardSectionHeading title="Automation streak" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should reveal the help text when the help button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardSectionHeading title="Automation streak" help="Consecutive UTC days." />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Consecutive UTC days.')).toBeInTheDocument();
  });
});
