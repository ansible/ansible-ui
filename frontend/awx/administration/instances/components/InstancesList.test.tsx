import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InstancesList } from './InstancesList';
import { useInstanceRowActions } from '../hooks/useInstanceRowActions';
import { useInstanceToolbarActions } from '../hooks/useInstanceToolbarActions';
import { useInstancesColumns } from '../hooks/useInstancesColumns';

const mockInstancesResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.options(awxAPI`/instances/`, () =>
    HttpResponse.json({
      actions: {
        GET: {},
        POST: {},
      },
    })
  ),
  http.get(awxAPI`/instances/`, () => HttpResponse.json(mockInstancesResponse)),
  http.get(
    ({ request }) => request.url.includes('/settings/system/'),
    () => HttpResponse.json({ IS_K8S: true })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function InstancesListWrapper() {
  const tableColumns = useInstancesColumns();
  return (
    <InstancesList
      useToolbarActions={useInstanceToolbarActions}
      useRowActions={useInstanceRowActions}
      tableColumns={tableColumns}
    />
  );
}

describe('InstancesList', () => {
  test('should render instances list with empty state', async () => {
    render(
      <MemoryRouter>
        <InstancesListWrapper />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(
          screen.getByText(/There are currently no instances added|You do not have permission/i)
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
