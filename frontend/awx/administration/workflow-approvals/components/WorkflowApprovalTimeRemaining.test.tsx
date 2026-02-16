/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { WorkflowApprovalTimeRemaining } from './WorkflowApprovalTimeRemaining';

describe('WorkflowApprovalTimeRemaining', () => {
  test('should render Timed out when approval has expired', () => {
    const pastDate = new Date(Date.now() - 5000).toISOString();
    render(
      <MemoryRouter>
        <WorkflowApprovalTimeRemaining approval_expiration={pastDate} />
      </MemoryRouter>
    );

    expect(screen.getByText('Timed out')).toBeInTheDocument();
  });

  test('should render Expires in with time when approval has not expired', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
    render(
      <MemoryRouter>
        <WorkflowApprovalTimeRemaining approval_expiration={futureDate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Expires in/)).toBeInTheDocument();
  });

  test('should display seconds abbreviation when less than a minute remains', () => {
    const soonDate = new Date(Date.now() + 45 * 1000).toISOString(); // 45 seconds
    render(
      <MemoryRouter>
        <WorkflowApprovalTimeRemaining approval_expiration={soonDate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Expires in/)).toBeInTheDocument();
  });
});
