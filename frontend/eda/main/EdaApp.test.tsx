import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { describe, expect, test, vi } from 'vitest';
import { EdaApp } from './EdaApp';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageApp: ({ defaultRefreshInterval }: { defaultRefreshInterval: number }) => (
    <div data-testid="page-app" data-refresh-interval={defaultRefreshInterval} />
  ),
}));

vi.mock('./useEdaNavigation', () => ({
  useEdaNavigation: () => [],
}));

vi.mock('./EdaMasthead', () => ({
  EdaMasthead: () => <div data-testid="eda-masthead" />,
}));

describe('EdaApp', () => {
  test('should render with defaultRefreshInterval of 30 seconds', async () => {
    render(
      <MemoryRouter>
        <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
          <EdaApp />
        </SWRConfig>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-app')).toBeInTheDocument();
    });

    expect(screen.getByTestId('page-app').dataset.refreshInterval).toBe('30');
  });
});
