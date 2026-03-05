import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CredentialsList } from './CredentialsList';

const server = setupServer(
  http.options(awxAPI`/credentials/`, () => HttpResponse.json({ actions: { GET: {}, POST: {} } })),
  http.get(awxAPI`/credentials/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(
    ({ request }) => request.url.includes('/credential_types/'),
    () =>
      HttpResponse.json({
        count: 0,
        results: [],
        next: null,
        previous: null,
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialsList', () => {
  it('should render empty state when no credentials exist', async () => {
    render(
      <MemoryRouter>
        <CredentialsList url={awxAPI`/credentials/`} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No credentials yet')).toBeInTheDocument();
    });
  });
});
