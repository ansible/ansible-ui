/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MyImports } from './MyImports';

const mockImports = {
  meta: { count: 1 },
  data: [
    {
      id: 'import-1',
      state: 'completed',
      version: '1.0.0',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:01:00Z',
      started_at: '2024-01-01T00:00:00Z',
      finished_at: '2024-01-01T00:01:00Z',
      namespace: 'demo',
      name: 'mycol',
    },
  ],
};

const server = setupServer(
  http.get('*/_ui/v1/imports/collections/', () => HttpResponse.json(mockImports)),
  http.get('*/_ui/v1/imports/collections/import-1/', () => HttpResponse.json(mockImports.data[0])),
  http.get('*/v3/plugin/ansible/search/collection-versions/*', () =>
    HttpResponse.json({ meta: { count: 1 }, data: [] })
  ),
  http.get('*/_ui/v1/my-namespaces/*', () => HttpResponse.json({ meta: { count: 0 }, data: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MyImports', () => {
  it('renders imports page when namespace is selected', async () => {
    render(
      <MemoryRouter initialEntries={['/imports?namespace=demo']}>
        <Routes>
          <Route path="/imports" element={<MyImports />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'My imports' })).toBeInTheDocument();
    });

    expect(screen.getByText('Imported collections')).toBeInTheDocument();
  });
});
