import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AwxApp } from './AwxApp';

vi.mock('./useAwxNavigation', () => ({
  useAwxNavigation: () => [{ id: 'dashboard', label: 'Dashboard' }],
}));

vi.mock('./AwxMasthead', () => ({
  AwxMasthead: () => <div data-testid="awx-masthead">Masthead</div>,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageApp: ({ masthead, navigation }: { masthead: React.ReactNode; navigation: unknown }) => (
      <div data-testid="page-app">
        {masthead}
        <span data-testid="nav-count">{Array.isArray(navigation) ? navigation.length : 0}</span>
      </div>
    ),
  };
});

describe('AwxApp', () => {
  it('renders PageApp with masthead and navigation', () => {
    render(<AwxApp />);

    expect(screen.getByTestId('page-app')).toBeInTheDocument();
    expect(screen.getByTestId('awx-masthead')).toBeInTheDocument();
    expect(screen.getByTestId('nav-count')).toHaveTextContent('1');
  });
});
