/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { getAllByText, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { edaAPI } from '../../common/eda-utils';
import { EdaActiveUserContext } from '../../common/useEdaActiveUser';
import { ActivationInstanceDetails } from './ActivationInstanceDetails';
import activationInstanceResp from './mocks/ActivationInstance.json';
import activationInstanceLogs from './mocks/ActivationInstanceLogs.json';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      'aria-label': string;
    }) => (
      <dialog open aria-label={ariaLabel}>
        {children}
      </dialog>
    ),
  };
});

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

  test('should clear only this instance logs and reload the displayed logs after success', async () => {
    const user = userEvent.setup();
    let logsCleared = false;
    let clearLogsRequestCount = 0;
    let activationClearLogsRequestCount = 0;
    let globalPurgeRequestCount = 0;
    const requestedBeforeDates: string[] = [];
    let logRequestCount = 0;

    server.use(
      http.get(edaAPI`/activation-instances/1/logs/`, () => {
        logRequestCount += 1;
        return logsCleared
          ? HttpResponse.json({ count: 0, results: [] })
          : HttpResponse.json(activationInstanceLogs);
      }),
      http.post(edaAPI`/activation-instances/1/clear-logs/`, async ({ request }) => {
        const body = (await request.json()) as { before_date: string };
        requestedBeforeDates.push(body.before_date);
        clearLogsRequestCount += 1;
        logsCleared = true;
        return HttpResponse.json({ deleted: 10 });
      }),
      http.post(edaAPI`/activations/1/clear-logs/`, () => {
        activationClearLogsRequestCount += 1;
        return HttpResponse.json({ deleted: 10 });
      }),
      http.post(edaAPI`/logs/purge/`, () => {
        globalPurgeRequestCount += 1;
        return HttpResponse.json({ deleted: 10 });
      })
    );

    const { container, getByRole, getByText, queryByRole } = render(
      <PageDialogProvider>
        <EdaActiveUserContext.Provider
          value={{
            activeEdaUser: {
              id: 1,
              username: 'admin',
              is_superuser: true,
              resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
              created_at: '2024-01-01T00:00:00Z',
              modified_at: '2024-01-01T00:00:00Z',
            },
          }}
        >
          <MemoryRouter initialEntries={['/rulebook-activations/1/history/1/details']}>
            <Routes>
              <Route
                path={`/rulebook-activations/:id/history/:instanceId/details`}
                element={<ActivationInstanceDetails />}
              />
            </Routes>
          </MemoryRouter>
        </EdaActiveUserContext.Provider>
      </PageDialogProvider>
    );

    await waitFor(() => {
      expect(getByText('Pulling image quay.io/ansible/ansible-rulebook:main')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: 'Clear logs' }));

    const confirmationDialog = getByRole('dialog', { name: 'Clear logs?' });
    expect(
      within(confirmationDialog).getByText(
        'Removes stored logs for the selected instance (1 - prat-rba). Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
    await user.click(
      within(confirmationDialog).getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(within(confirmationDialog).getByRole('button', { name: 'Clear logs' }));

    const progressDialog = await waitFor(() => getByRole('dialog', { name: 'Clearing logs' }));
    expect(within(progressDialog).getByText('1 - prat-rba')).toBeInTheDocument();

    await waitFor(() => expect(clearLogsRequestCount).toBe(1), { timeout: 2000 });

    await waitFor(
      () => {
        expect(queryByRole('dialog', { name: 'Clear logs?' })).not.toBeInTheDocument();
        expect(container.querySelector('.output-grid-row')).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(clearLogsRequestCount).toBe(1);
    expect(requestedBeforeDates).toHaveLength(1);
    expect(requestedBeforeDates[0]).toMatch(/Z$/);
    expect(activationClearLogsRequestCount).toBe(0);
    expect(globalPurgeRequestCount).toBe(0);
    expect(logRequestCount).toBe(2);
  });

  test('should allow non-admin users to open instance clear logs for backend authorization', async () => {
    const user = userEvent.setup();
    const { findByRole, getByRole } = render(
      <PageDialogProvider>
        <EdaActiveUserContext.Provider
          value={{
            activeEdaUser: {
              id: 1,
              username: 'user',
              is_superuser: false,
              resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
              created_at: '2024-01-01T00:00:00Z',
              modified_at: '2024-01-01T00:00:00Z',
            },
          }}
        >
          <MemoryRouter initialEntries={['/rulebook-activations/1/history/1/details']}>
            <Routes>
              <Route
                path={`/rulebook-activations/:id/history/:instanceId/details`}
                element={<ActivationInstanceDetails />}
              />
            </Routes>
          </MemoryRouter>
        </EdaActiveUserContext.Provider>
      </PageDialogProvider>
    );

    await user.click(await findByRole('button', { name: 'Clear logs' }));
    expect(getByRole('dialog', { name: 'Clear logs?' })).toBeInTheDocument();
  });

  test('should show the parsed permission error when instance clear logs is forbidden', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(edaAPI`/activation-instances/1/clear-logs/`, () =>
        HttpResponse.json(
          { detail: 'You do not have permission to clear logs for this instance.' },
          { status: 403 }
        )
      )
    );

    const { getByRole, getByText } = render(
      <PageDialogProvider>
        <EdaActiveUserContext.Provider
          value={{
            activeEdaUser: {
              id: 1,
              username: 'user',
              is_superuser: false,
              resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
              created_at: '2024-01-01T00:00:00Z',
              modified_at: '2024-01-01T00:00:00Z',
            },
          }}
        >
          <MemoryRouter initialEntries={['/rulebook-activations/1/history/1/details']}>
            <Routes>
              <Route
                path={`/rulebook-activations/:id/history/:instanceId/details`}
                element={<ActivationInstanceDetails />}
              />
            </Routes>
          </MemoryRouter>
        </EdaActiveUserContext.Provider>
      </PageDialogProvider>
    );

    await waitFor(() => {
      expect(getByText('Pulling image quay.io/ansible/ansible-rulebook:main')).toBeInTheDocument();
    });
    await user.click(getByRole('button', { name: 'Clear logs' }));
    const confirmationDialog = getByRole('dialog', { name: 'Clear logs?' });
    await user.click(
      within(confirmationDialog).getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(within(confirmationDialog).getByRole('button', { name: 'Clear logs' }));

    const progressDialog = await waitFor(() => getByRole('dialog', { name: 'Clearing logs' }));
    expect(
      await within(progressDialog).findByText(
        'You do not have permission to clear logs for this instance.'
      )
    ).toBeInTheDocument();
    expect(within(progressDialog).getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(within(progressDialog).getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
