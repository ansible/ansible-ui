/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { EdaActiveUserContext } from '../../common/useEdaActiveUser';
import { RulebookActivationHistory } from './RulebookActivationHistory';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
      elementToFocus,
    }: {
      children: React.ReactNode;
      'aria-label': string;
      elementToFocus?: string;
    }) => (
      <dialog open aria-label={ariaLabel} data-element-to-focus={elementToFocus}>
        {children}
      </dialog>
    ),
  };
});

const mockInstances = {
  count: 2,
  results: [
    {
      id: 1,
      name: 'Instance 1',
      status: 'running',
      activation_id: 5,
      started_at: '2023-10-01T12:00:00Z',
      organization_id: 1,
    },
    {
      id: 2,
      name: 'Instance 2',
      status: 'completed',
      activation_id: 5,
      started_at: '2023-10-02T14:00:00Z',
      organization_id: 1,
    },
  ],
};

const server = setupServer();

const mockActiveUser = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

function renderHistory(
  activeEdaUser = mockActiveUser,
  initialEntry = '/rulebook-activations/5/history',
  routePath = '/rulebook-activations/:id/history'
) {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <PageDialogProvider>
        <EdaActiveUserContext.Provider value={{ activeEdaUser }}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path={routePath} element={<RulebookActivationHistory />} />
            </Routes>
          </MemoryRouter>
        </EdaActiveUserContext.Provider>
      </PageDialogProvider>
    </SWRConfig>
  );
}

describe('RulebookActivationHistory', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  beforeEach(() => {
    server.use(
      http.get('*/activations/5/', () => HttpResponse.json({ id: 5, name: 'Activation 5' }))
    );
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the history table with instances', async () => {
    server.use(
      http.get('*/activations/5/instances/*', () => {
        return HttpResponse.json(mockInstances);
      })
    );
    renderHistory();

    await waitFor(() => {
      expect(screen.getByText(/Instance 1/)).toBeInTheDocument();
    });
  });

  it('should render empty state when no history exists', async () => {
    server.use(
      http.get('*/activations/5/instances/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );
    renderHistory();

    await waitFor(() => {
      expect(screen.getByText('No activation history')).toBeInTheDocument();
    });
  });

  it('should render error state on API failure', async () => {
    server.use(
      http.get('*/activations/5/instances/*', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    renderHistory();

    await waitFor(() => {
      expect(screen.getByText('Error loading history')).toBeInTheDocument();
    });
  });

  it('should confirm before clearing logs for a system administrator', async () => {
    const user = userEvent.setup();
    const clearLogs = vi.fn();
    server.use(
      http.get('*/activations/5/', () => HttpResponse.json({ id: 5, name: 'Activation 5' })),
      http.get('*/activations/5/instances/*', () => HttpResponse.json(mockInstances)),
      http.post('*/activations/5/clear-logs/', async ({ request }) => {
        expect(await request.text()).toMatch(/"before_date":"[^"]+"/);
        clearLogs();
        return HttpResponse.json({ deleted: 2 });
      })
    );
    renderHistory();

    await user.click(await screen.findByRole('button', { name: 'Clear logs' }));

    const dialog = screen.getByRole('dialog', { name: 'Clear logs?' });
    expect(
      within(dialog).getByText(
        'Removes stored logs for Activation 5. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-element-to-focus', '#clear-logs-cancel');
    expect(within(dialog).getByRole('button', { name: 'Clear logs' })).toBeDisabled();

    await user.click(
      within(dialog).getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Clear logs' }));

    await waitFor(() => expect(clearLogs).toHaveBeenCalledOnce());
  });

  it('should use the fallback activation label when the activation has no name', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/activations/5/', () => HttpResponse.json({ id: 5 })),
      http.get('*/activations/5/instances/*', () => HttpResponse.json(mockInstances))
    );
    renderHistory();

    await user.click(await screen.findByRole('button', { name: 'Clear logs' }));

    expect(
      within(screen.getByRole('dialog', { name: 'Clear logs?' })).getByText(
        'Removes stored logs for Rulebook activation. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
  });

  it('should not open the clear logs dialog when the activation id is missing', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/activations//instances/*', () => HttpResponse.json(mockInstances)));
    renderHistory(mockActiveUser, '/rulebook-activations', '/rulebook-activations');

    await user.click(await screen.findByRole('button', { name: 'Clear logs' }));

    expect(screen.queryByRole('dialog', { name: 'Clear logs?' })).not.toBeInTheDocument();
  });

  it('should allow non-admin users to open clear logs for backend authorization', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/activations/5/instances/*', () => HttpResponse.json(mockInstances)));

    renderHistory({ ...mockActiveUser, is_superuser: false });

    const clearLogs = await screen.findByRole('button', { name: 'Clear logs' });
    await user.click(clearLogs);
    expect(screen.getByRole('dialog', { name: 'Clear logs?' })).toBeInTheDocument();
  });
});
