/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformTeamList } from './PlatformTeamList';

const mockTeams = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Team 1',
      description: 'First team',
      organization: { id: 1, name: 'Default' },
      created_at: '2023-10-01T12:00:00Z',
      modified_at: '2023-10-02T12:00:00Z',
    },
    {
      id: 2,
      name: 'Team 2',
      description: 'Second team',
      organization: { id: 1, name: 'Default' },
      created_at: '2023-10-01T12:00:00Z',
      modified_at: '2023-10-02T12:00:00Z',
    },
  ],
};

describe('PlatformTeamList', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the teams list', async () => {
    server.use(
      http.get('*/teams/*', () => {
        return HttpResponse.json(mockTeams);
      }),
      http.options('*/teams/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <PlatformTeamList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    server.use(
      http.get('*/teams/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/teams/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <PlatformTeamList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/do not have permission to create a team/i)).toBeInTheDocument();
    });
  });

  it('exports the PlatformTeamList component', () => {
    expect(PlatformTeamList).toBeDefined();
    expect(typeof PlatformTeamList).toBe('function');
  });
});
