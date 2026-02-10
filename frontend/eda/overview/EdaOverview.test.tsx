/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaOverview } from './EdaOverview';

describe('EdaOverview', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the overview page with correct title', async () => {
    server.use(
      http.get('*/projects/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/activations/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/decision-environments/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/audit-rules/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/users/me/awx-tokens/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter>
        <EdaOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Connect intelligence, analytics and service requests/i)
      ).toBeInTheDocument();
    });
  });

  it('renders empty state for cards', async () => {
    server.use(
      http.get('*/projects/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/activations/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/decision-environments/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/audit-rules/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/users/me/awx-tokens/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { container } = render(
      <MemoryRouter>
        <EdaOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.firstChild).not.toBeNull();
    });
  });
});
