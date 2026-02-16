import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventoryJobTemplates } from './InventoryJobTemplates';

const mockTemplatesResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const mockOptionsResponse = {
  actions: { GET: {}, POST: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/job_templates/'),
    () => HttpResponse.json(mockTemplatesResponse)
  ),
  http.options(
    ({ request }) => request.url.includes('/job_templates/'),
    () => HttpResponse.json(mockOptionsResponse)
  ),
  http.options(
    ({ request }) => request.url.includes('/workflow_job_templates/'),
    () => HttpResponse.json(mockOptionsResponse)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryJobTemplates', () => {
  it('should render templates list for inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/templates']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/templates"
            element={<InventoryJobTemplates />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No templates yet')).toBeInTheDocument();
    });
  });
});
