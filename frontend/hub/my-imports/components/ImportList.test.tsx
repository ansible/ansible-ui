/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CollectionImport } from '../../collections/Collection';
import { ImportList } from './ImportList';

vi.mock('../hooks/useNamespaceSelector', () => ({
  useSelectNamespaceSingle: () => ({
    openBrowse: vi.fn(),
    isOpen: false,
    onSelect: vi.fn(),
    onClose: vi.fn(),
    selection: undefined,
  }),
}));

const mockImport: CollectionImport = {
  id: '1',
  state: 'completed',
  version: '1.0.0',
  created_at: '',
  updated_at: '',
  started_at: '',
  finished_at: '',
  namespace: 'demo',
  name: 'col',
};

const server = setupServer(
  http.get('*/_ui/v1/my-namespaces/*', () => HttpResponse.json({ meta: { count: 0 }, data: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ImportList', () => {
  it('renders import rows when data is provided', async () => {
    render(
      <MemoryRouter>
        <ImportList
          collectionImports={[mockImport]}
          selectedImport=""
          setSelectedImport={vi.fn()}
          setSelectedNamespace={vi.fn()}
          setDrawerExpanded={vi.fn()}
          collectionFilter={{}}
          setCollectionFilter={vi.fn()}
          queryParams={{ namespace: 'demo', page: 1, perPage: 10 }}
          setPage={vi.fn()}
          setPerPage={vi.fn()}
          isLoading={false}
          itemCount={1}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('col v1.0.0')).toBeInTheDocument();
    });
  });
});
