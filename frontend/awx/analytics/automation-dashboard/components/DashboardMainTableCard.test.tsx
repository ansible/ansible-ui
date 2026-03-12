import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardMainTableCard } from './DashboardMainTableCard';

describe('DashboardMainTableCard', () => {
  it('renders all DashboardValueCards', () => {
    render(<DashboardMainTableCard />);
    expect(screen.getByTestId('cost-manual-automation-card')).toBeInTheDocument();
    expect(screen.getByTestId('cost-automated-execution-card')).toBeInTheDocument();
    expect(screen.getByTestId('total-savings-card')).toBeInTheDocument();
    expect(screen.getByTestId('total-hours-saved-card')).toBeInTheDocument();
  });

  it('renders the table with correct columns', () => {
    render(<DashboardMainTableCard />);
    // Table headers
    expect(screen.getByText('Template Name')).toBeInTheDocument();
    expect(screen.getByText('Number of job executions')).toBeInTheDocument();
    expect(screen.getByText('Time taken to manually execute (min)')).toBeInTheDocument();
    expect(screen.getByText('Time taken to create automation (min)')).toBeInTheDocument();
    expect(screen.getByText('Running time')).toBeInTheDocument();
    expect(screen.getByText('Automated cost')).toBeInTheDocument();
    expect(screen.getByText('Manual cost')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('renders the toolbar row', () => {
    render(<DashboardMainTableCard />);
    expect(screen.getByTestId('cost_manual_automation_input')).toBeInTheDocument();
    expect(screen.getByTestId('cost_automated_execution')).toBeInTheDocument();
    expect(screen.getByLabelText(/Include time taken to create automation/i)).toBeInTheDocument();
  });

  it('renders input fields for each row', () => {
    render(<DashboardMainTableCard />);
    // There are 10 items, so expect 10 input fields for time_taken_manually_execute
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByTestId(`time_taken_manually_execute_minutes_${i}`)).toBeInTheDocument();
      expect(screen.getByTestId(`time_taken_create_automation_minutes_${i}`)).toBeInTheDocument();
    }
  });
});
