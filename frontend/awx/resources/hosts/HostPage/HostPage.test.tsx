import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HostPage } from './HostPage';

const mockHost = {
  id: 1,
  name: 'Test Host',
  inventory: 1,
  enabled: true,
  summary_fields: {
    inventory: { id: 1, name: 'Default' },
    user_capabilities: {},
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/hosts/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockHost)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HostPage', () => {
  it('should display host name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/hosts/1']}>
        <Routes>
          <Route path="/hosts/:id" element={<HostPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Host');
    });
  });
});
