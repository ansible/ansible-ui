import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { ExecutionEnvironmentsList } from './ExecutionEnvironmentsList';

const server = setupServer(
  http.options(awxAPI`/execution_environments/`, () =>
    HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(awxAPI`/execution_environments/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentsList', () => {
  it('should render empty state when no execution environments exist', async () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironmentsList hideOrgColumn={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No execution environments yet')).toBeInTheDocument();
    });
  });

  it('should render with custom url prop', async () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironmentsList url={awxAPI`/execution_environments/`} hideOrgColumn={true} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No execution environments yet')).toBeInTheDocument();
    });
  });
});
