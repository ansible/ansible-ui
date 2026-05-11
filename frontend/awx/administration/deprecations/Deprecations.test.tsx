import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi } from 'vitest';
import { Deprecations } from './Deprecations';

// Mock the DeprecationsDashboard component
vi.mock('./DeprecationsDashboard', () => ({
  DeprecationsDashboard: () => <div data-testid="deprecations-dashboard">Dashboard</div>,
}));

describe('Deprecations', () => {
  it('should render the deprecations page', () => {
    render(
      <MemoryRouter>
        <Deprecations />
      </MemoryRouter>
    );
  });
});
