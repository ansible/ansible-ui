/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CollectionSignatureUpload } from './CollectionSignatureUpload';

const server = setupServer(
  http.get('*/v3/plugin/ansible/search/collection-versions/*', () =>
    HttpResponse.json({
      meta: { count: 1 },
      data: [
        {
          collection_version: {
            namespace: 'demo',
            name: 'col',
            version: '1.0.0',
          },
          repository: { name: 'published' },
        },
      ],
    })
  ),
  http.get('*/pulp/api/v3/repositories/ansible/ansible/*', () =>
    HttpResponse.json({ count: 1, results: [{ name: 'published', pulp_href: '/repo/' }] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CollectionSignatureUpload', () => {
  it('renders upload signature form', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/collections/upload-signature?name=col&namespace=demo&repository=published&version=1.0.0',
        ]}
      >
        <Routes>
          <Route path="/collections/upload-signature" element={<CollectionSignatureUpload />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Signature upload' })).toBeInTheDocument();
    });
  });
});
