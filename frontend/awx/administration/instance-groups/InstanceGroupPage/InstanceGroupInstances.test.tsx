import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstanceGroupInstances } from './InstanceGroupInstances';

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('instances') && request.url.includes('instance_groups'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('instances') && request.url.includes('instance_groups'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupInstances', () => {
  it('should render instances list', async () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/1/instances']}>
        <Routes>
          <Route path="/instance-groups/:id/instances" element={<InstanceGroupInstances />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('There are currently no instances added')).toBeInTheDocument();
    });
  });
});
