import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { describe, expect, test, vi } from 'vitest';
import { HubApp } from './HubApp';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageApp: ({ defaultRefreshInterval }: { defaultRefreshInterval: number }) => (
    <div data-testid="page-app" data-refresh-interval={defaultRefreshInterval} />
  ),
}));

vi.mock('./useHubNavigation', () => ({
  useHubNavigation: () => [],
}));

vi.mock('./HubMasthead', () => ({
  HubMasthead: () => <div data-testid="hub-masthead" />,
}));

describe('HubApp', () => {
  test('should render with defaultRefreshInterval of 30 seconds', async () => {
    render(
      <MemoryRouter>
        <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
          <HubApp />
        </SWRConfig>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-app')).toBeInTheDocument();
    });

    expect(screen.getByTestId('page-app').dataset.refreshInterval).toBe('30');
  });
});
