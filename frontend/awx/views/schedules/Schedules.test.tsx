import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Schedules } from './Schedules';

const server = setupServer(
  http.options(awxAPI`/schedules/`, () => HttpResponse.json({ actions: { GET: {}, POST: {} } })),
  http.get(awxAPI`/schedules/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Schedules', () => {
  it('should render Schedules page with title', async () => {
    render(
      <MemoryRouter>
        <Schedules />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Schedules')).toBeInTheDocument();
    });
  });
});
