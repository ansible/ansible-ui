import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Jobs } from './Jobs';

const server = setupServer(
  http.options(awxAPI`/unified_job_templates/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/unified_jobs/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Jobs', () => {
  it('should render Jobs page with title', async () => {
    render(
      <MemoryRouter>
        <Jobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });
  });
});
