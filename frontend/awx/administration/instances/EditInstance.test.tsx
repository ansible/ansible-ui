import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EditInstance } from './EditInstance';

const mockInstance = {
  id: 1,
  hostname: 'test-instance',
  cpu_capacity: 4,
  mem_capacity: 8,
  capacity_adjustment: 0.5,
  enabled: true,
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/instances/1/') && !request.url.includes('/instance_groups/'),
    () => HttpResponse.json(mockInstance)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EditInstance', () => {
  it('should render edit form with instance hostname in title', async () => {
    render(
      <MemoryRouter initialEntries={['/instances/1/edit']}>
        <Routes>
          <Route path="/instances/:id/edit" element={<EditInstance />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('test-instance');
    });
  });

  it('should render Capacity slider and Enabled checkbox', async () => {
    render(
      <MemoryRouter initialEntries={['/instances/1/edit']}>
        <Routes>
          <Route path="/instances/:id/edit" element={<EditInstance />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Capacity')).toBeInTheDocument();
    });

    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});
