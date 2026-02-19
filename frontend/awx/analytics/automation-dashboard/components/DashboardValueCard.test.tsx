import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { DashboardValueCard } from './DashboardValueCard';
import { DashboardValueCardProps } from '../types';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const defaultProps: DashboardValueCardProps = {
  id: 'test-card',
  title: 'Test Title',
  help: 'Help text',
  value: 12345,
  linkText: 'Details',
  to: '/execution/jobs',
  valueSuffix: 'EUR',
};

describe('DashboardValueCard', () => {
  test('renders title, value, and suffix', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText(/12.345/)).toBeTruthy();
    expect(screen.queryByText(/EUR/)).toBeTruthy();
  });

  test('renders help text if provided', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    const helpButton = screen.getByRole('button');
    await user.click(helpButton);
    expect(screen.getByText('Help text')).toBeTruthy();
  });

  test('renders link text if provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Details')).toBeTruthy();
  });

  test('renders value as string if not a number', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} value="Test value" valueSuffix={undefined} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test value')).toBeTruthy();
  });

  test('does not render valueSuffix if not provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} valueSuffix={undefined} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/EUR/)).toBeNull();
  });
});
