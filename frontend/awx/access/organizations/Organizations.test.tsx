import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Organizations } from './Organizations';

const server = setupServer(
  http.options(awxAPI`/organizations/`, () =>
    HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Organizations', () => {
  it('should render Organizations page with title', async () => {
    render(
      <MemoryRouter>
        <Organizations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organizations')).toBeInTheDocument();
    });
  });

  it('should display organizations in the table when results exist', async () => {
    server.use(
      http.get(awxAPI`/organizations/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 1, name: 'Default', description: '', summary_fields: {} }],
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter>
        <Organizations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });
});
