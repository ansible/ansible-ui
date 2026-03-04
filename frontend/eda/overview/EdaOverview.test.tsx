/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setEdaApiPath } from '../common/eda-utils';
import { EdaOverview } from './EdaOverview';

describe('EdaOverview', () => {
  const server = setupServer();

  beforeAll(() => {
    setEdaApiPath('/api/eda/v1');
    server.listen({ onUnhandledRequest: 'warn' });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockEmptyResponses = () => {
    server.use(
      http.get('/api/eda/v1/projects/', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      }),
      http.get('/api/eda/v1/activations/', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      }),
      http.get('/api/eda/v1/decision-environments/', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      }),
      http.get('/api/eda/v1/audit-rules/', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      }),
      http.get('*/users/me/awx-tokens/*', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      })
    );
  };

  it('should render the overview page with correct title', async () => {
    mockEmptyResponses();

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

  it('should display correct card titles and subtitles', async () => {
    mockEmptyResponses();

    render(
      <MemoryRouter>
        <EdaOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Recently updated projects')).toBeInTheDocument();

      expect(screen.getByText('Rulebook Activations')).toBeInTheDocument();
      expect(screen.getByText('Recently updated rulebook activations')).toBeInTheDocument();

      expect(screen.getByText('Decision Environments')).toBeInTheDocument();
      expect(screen.getByText('Recently updated decision environments')).toBeInTheDocument();

      expect(screen.getByText('Rule Audit')).toBeInTheDocument();
      expect(screen.getByText('Recently fired rules')).toBeInTheDocument();
    });
  });

  it('should show Getting Started card when no projects and rulebook activations exist', async () => {
    mockEmptyResponses();

    render(
      <MemoryRouter>
        <EdaOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Event-Driven Ansible is a highly scalable, flexible automation capability/i
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Project')).toBeInTheDocument();
      expect(screen.getByText('Decision Environment')).toBeInTheDocument();
      expect(screen.getByText('Rulebook Activation')).toBeInTheDocument();
    });
  });

  it('should hide Getting Started card when projects and rulebook activations exist', async () => {
    server.use(
      http.get('/api/eda/v1/projects/', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'Test Project',
              description: 'Test Description',
              created_at: '2023-06-21T14:14:06.573532Z',
              modified_at: '2023-06-21T14:14:06.573544Z',
            },
          ],
          next: null,
          previous: null,
        });
      }),
      http.get('/api/eda/v1/activations/', () => {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              name: 'Test Activation',
              is_enabled: true,
              status: 'running',
              created_at: '2023-06-21T14:14:06.573532Z',
              modified_at: '2023-06-21T14:14:06.573544Z',
            },
          ],
          next: null,
          previous: null,
        });
      }),
      http.get('/api/eda/v1/decision-environments/', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      }),
      http.get('/api/eda/v1/audit-rules/', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      }),
      http.get('*/users/me/awx-tokens/*', () => {
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      })
    );

    render(
      <MemoryRouter>
        <EdaOverview />
      </MemoryRouter>
    );

    // Wait for data to load - empty states should not be visible
    await waitFor(
      () => {
        expect(screen.queryByText('There are currently no projects')).not.toBeInTheDocument();
        expect(
          screen.queryByText('There are currently no rulebook activations')
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Now verify Getting Started card is not present since we have data
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument();
  });
});
