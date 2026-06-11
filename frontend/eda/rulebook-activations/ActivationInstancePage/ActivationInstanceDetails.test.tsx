/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { getAllByText, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { ActivationInstanceDetails } from './ActivationInstanceDetails';
import activationInstanceResp from './mocks/ActivationInstance.json';
import activationInstanceLogs from './mocks/ActivationInstanceLogs.json';

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const restHandlers = [
  http.get(edaAPI`/activation-instances/1/`, () => {
    return HttpResponse.json(activationInstanceResp);
  }),
  http.get(edaAPI`/activation-instances/1/logs`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('log');

    if (search) {
      const results = activationInstanceLogs.results.filter((line) => {
        return line.log === search;
      });
      return HttpResponse.json({
        count: 1,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: results,
      });
    } else {
      return HttpResponse.json(activationInstanceLogs);
    }
  }),
];

describe('ActivationInstanceDetails', () => {
  const server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
  });

  test('should render the details page with logger showing correct info and number of lines', async () => {
    const { getByText, container } = render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/history/1/details']}>
        <Routes>
          <Route
            path={`/rulebook-activations/:id/history/:instanceId/details`}
            element={<ActivationInstanceDetails />}
          />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      const grid = container.querySelector('.output-grid');
      expect(grid).toBeInTheDocument();
      const rows = grid?.querySelectorAll('.output-grid-row');
      expect(rows?.length).toBe(10);
      expect(getByText('Pulling image quay.io/ansible/ansible-rulebook:main')).toBeInTheDocument();
      expect(
        getAllByText(container, new Date(1743599903 * 1000).toLocaleString())[0]
      ).toBeInTheDocument();
    });
  });

  test('should search and find correct number of results', async () => {
    const { container, getByRole } = render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/history/1/details']}>
        <Routes>
          <Route
            path={`/rulebook-activations/:id/history/:instanceId/details`}
            element={<ActivationInstanceDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial grid to render
    await waitFor(() => {
      const grid = container.querySelector('.output-grid');
      expect(grid).toBeInTheDocument();
    });

    // Find and type in search input
    const searchInput = getByRole('textbox');
    await userEvent.type(searchInput, 'Pulling image quay.io/ansible/ansible-rulebook:main');

    // Wait for debounce and filtered results
    await timeout(500);

    await waitFor(() => {
      const grid = container.querySelector('.output-grid');
      const rows = grid?.querySelectorAll('.output-grid-row');
      expect(rows?.length).toBe(1);
      if (rows?.length === 1) {
        expect(
          within(rows[0] as HTMLElement).getByText(
            'Pulling image quay.io/ansible/ansible-rulebook:main'
          )
        ).toBeInTheDocument();
      }
    });
  });
});
