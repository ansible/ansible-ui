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
      <div role="dialog" aria-label={ariaLabel} data-element-to-focus={elementToFocus}>
        {children}
      </div>
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

function renderHistory(activeEdaUser = mockActiveUser) {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <PageDialogProvider>
        <EdaActiveUserContext.Provider value={{ activeEdaUser }}>
          <MemoryRouter initialEntries={['/rulebook-activations/5/history']}>
            <Routes>
              <Route
                path="/rulebook-activations/:id/history"
                element={<RulebookActivationHistory />}
              />
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

  it('should show disabled clear logs with a permission tooltip for a non-admin user', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/activations/5/instances/*', () => HttpResponse.json(mockInstances)));

    renderHistory({ ...mockActiveUser, is_superuser: false });

    const clearLogs = await screen.findByRole('button', { name: 'Clear logs' });
    expect(clearLogs).toHaveAttribute('aria-disabled', 'true');

    await user.hover(clearLogs);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'You do not have permission to clear logs. Please contact your system administrator if there is an issue with your access.'
    );
  });
});
