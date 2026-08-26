/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageDashboardGettingStarted } from './PageDashboardGettingStarted';

describe('PageDashboardGettingStarted', () => {
  const incompleteSteps = [
    { title: 'Step 1', description: 'First step', to: '/step1', isComplete: false },
    { title: 'Step 2', description: 'Second step', to: '/step2', isComplete: true },
  ];

  const completeSteps = [
    { title: 'Step 1', description: 'First step', to: '/step1', isComplete: true },
    { title: 'Step 2', description: 'Second step', to: '/step2', isComplete: true },
  ];

  it('should render when steps are not all complete', () => {
    render(
      <MemoryRouter>
        <PageDashboardGettingStarted steps={incompleteSteps}>
          <p>Welcome message</p>
        </PageDashboardGettingStarted>
      </MemoryRouter>
    );

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Welcome message')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('should render nothing when all steps are complete', () => {
    const { container } = render(
      <MemoryRouter>
        <PageDashboardGettingStarted steps={completeSteps}>
          <p>Welcome message</p>
        </PageDashboardGettingStarted>
      </MemoryRouter>
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render step descriptions', () => {
    render(
      <MemoryRouter>
        <PageDashboardGettingStarted steps={incompleteSteps}>
          <p>Welcome</p>
        </PageDashboardGettingStarted>
      </MemoryRouter>
    );

    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
  });

  it('should render step links', () => {
    render(
      <MemoryRouter>
        <PageDashboardGettingStarted steps={incompleteSteps}>
          <p>Welcome</p>
        </PageDashboardGettingStarted>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Step 1' });
    expect(link).toHaveAttribute('href', '/step1');
  });
});
