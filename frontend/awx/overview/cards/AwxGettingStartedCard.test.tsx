import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AwxGettingStartedCard } from './AwxGettingStartedCard';

describe('AwxGettingStartedCard', () => {
  it('should render steps and documentation link', () => {
    render(
      <MemoryRouter>
        <AwxGettingStartedCard
          hasInventory={false}
          hasExecutionEnvironment={false}
          hasJobTemplate={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Execution Environment')).toBeInTheDocument();
    expect(screen.getByText('Job Template')).toBeInTheDocument();
    expect(screen.getByText(/To learn how to get started/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'documentation' })).toBeInTheDocument();
  });
});
