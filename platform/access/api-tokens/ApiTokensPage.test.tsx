import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiTokensPage } from './ApiTokensPage';

vi.mock('./ApiTokensTable', () => ({
  ApiTokensTable: () => <div data-testid="api-tokens-table">tokens</div>,
}));

describe('ApiTokensPage', () => {
  it('renders page header and ApiTokensTable', () => {
    render(<ApiTokensPage />);

    expect(screen.getByTestId('page-title')).toHaveTextContent('API Tokens');
    expect(
      screen.getByText('API tokens used for authentication and authorization in automation.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('api-tokens-table')).toBeInTheDocument();
  });
});
