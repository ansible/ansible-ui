import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Deprecations } from './Deprecations';

// Mock the DeprecationsDashboard component
vi.mock('./DeprecationsDashboard', () => ({
  DeprecationsDashboard: () => <div data-testid="deprecations-dashboard">Dashboard</div>,
}));

describe('Deprecations', () => {
  it('should render the deprecations dashboard component', () => {
    render(
      <MemoryRouter>
        <Deprecations />
      </MemoryRouter>
    );

    expect(screen.getByTestId('deprecations-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
