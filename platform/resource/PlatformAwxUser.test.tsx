import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PlatformAwxUser } from './PlatformAwxUser';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => vi.fn(() => '/mock-resource-route'),
  };
});

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}
    >
      <MemoryRouter initialEntries={['/users/1']}>
        <Routes>
          <Route path="/users/:id" element={children} />
          <Route path="/mock-resource-route" element={<div>Navigated</div>} />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

function renderPlatformAwxUser() {
  return render(<PlatformAwxUser />, { wrapper });
}

// Regression coverage for #3367: the error branch built its EmptyStateCustom JSX
// but never returned it, so a failed request silently fell through to the next
// check (or rendered a blank page) instead of showing an error state.
describe('PlatformAwxUser', () => {
  test('should show a loading state while the request is pending', () => {
    server.use(http.get(awxAPI`/users/1/`, () => new Promise(() => {})));
    renderPlatformAwxUser();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should render the error state when the request fails', async () => {
    server.use(
      http.get(awxAPI`/users/1/`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 }))
    );
    renderPlatformAwxUser();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Error' })).toBeInTheDocument();
    });
    expect(screen.getByText('An error occurred while loading the resource.')).toBeInTheDocument();
    expect(screen.queryByText('Navigated')).not.toBeInTheDocument();
  });

  test('should render the not-found state when the resource has no resource_type', async () => {
    server.use(
      http.get(awxAPI`/users/1/`, () =>
        HttpResponse.json({ id: 1, summary_fields: { resource: {} } })
      )
    );
    renderPlatformAwxUser();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Resource Not Found' })).toBeInTheDocument();
    });
  });

  test('should navigate to the resource route when the resource loads successfully', async () => {
    server.use(
      http.get(awxAPI`/users/1/`, () =>
        HttpResponse.json({
          id: 1,
          summary_fields: {
            resource: { resource_type: 'shared.user', ansible_id: 'abc-123' },
          },
        })
      )
    );
    renderPlatformAwxUser();

    await waitFor(() => {
      expect(screen.getByText('Navigated')).toBeInTheDocument();
    });
  });
});
