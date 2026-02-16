import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import activityStreamFixture from '@ansible/cypress/fixtures/activity_stream.json';
import emptyListFixture from '@ansible/cypress/fixtures/emptyList.json';
import mockActivityStreamOptions from '@ansible/cypress/fixtures/mock_activity_stream_options.json';
import { awxAPI } from '../../common/api/awx-utils';
import { ActivityStreams } from './ActivityStream';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </SWRConfig>
  );
}

const server = setupServer(
  http.options(awxAPI`/activity_stream/`, () => HttpResponse.json(mockActivityStreamOptions)),
  http.get(
    ({ request }) => request.url.includes('activity_stream'),
    ({ request }) => {
      if (request.url.includes('or__object1__in=job') || request.url.includes('object1__in=job'))
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
      return HttpResponse.json(activityStreamFixture);
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ActivityStream', () => {
  it('should display error when activity stream fails to load', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('activity_stream'),
        () => new HttpResponse(null, { status: 500 })
      )
    );

    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading activity stream')).toBeInTheDocument();
    });
  });

  it('should display empty state when there are no activity streams', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('activity_stream'),
        () => HttpResponse.json(emptyListFixture)
      )
    );

    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Stream')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('There are currently no activity streams')).toBeInTheDocument();
    });
  });

  it('should display activity stream list with rows', async () => {
    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Stream')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getAllByText(/admin/).length).toBeGreaterThan(0);
    });
  });

  it('should show filter controls when filters are expanded', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/admin/).length).toBeGreaterThan(0);
    });

    const filtersGroup = document.getElementById('filters');
    expect(filtersGroup).toBeInTheDocument();
    await user.click(
      within(filtersGroup as HTMLElement).getByRole('button', { name: 'Show Filters' })
    );
    expect(screen.getByTestId('filter')).toBeInTheDocument();
    expect(document.getElementById('filter-input')).toBeInTheDocument();
  });
});
