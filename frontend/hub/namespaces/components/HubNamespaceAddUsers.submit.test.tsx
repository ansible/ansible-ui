import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespaceAddUsers } from './HubNamespaceAddUsers';

const wizardCapture = vi.hoisted(() => ({
  onSubmit: undefined as ((data: unknown) => Promise<void>) | undefined,
  onCancel: undefined as (() => void) | undefined,
  steps: [] as PageWizardStep[],
}));
const progressDialog = vi.hoisted(() => vi.fn());
const pageNavigate = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
    PageWizard: <T,>(props: {
      onSubmit: (data: T) => Promise<void>;
      onCancel: () => void;
      steps: PageWizardStep[];
    }) => {
      wizardCapture.onSubmit = props.onSubmit as typeof wizardCapture.onSubmit;
      wizardCapture.onCancel = props.onCancel;
      wizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
  };
});

vi.mock('../../common/useHubBulkActionDialog', () => ({
  useHubBulkActionDialog: () => progressDialog,
}));

const namespaceResponse = {
  meta: { count: 1 },
  links: {},
  data: [{ id: 8, name: 'demo', pulp_href: '/namespaces/8/' }],
};

const server = setupServer(
  http.get('*/_ui/v1/namespaces/*', () => HttpResponse.json(namespaceResponse)),
  http.post('*/role_user_assignments/', () => HttpResponse.json({ id: 1 }, { status: 201 }))
);

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/namespaces/demo/user-access/add']}>
      <Routes>
        <Route path="/namespaces/:id/user-access/add" element={<HubNamespaceAddUsers />} />
      </Routes>
    </MemoryRouter>
  );
}

function step(id: string) {
  const found = wizardCapture.steps.find((item) => item.id === id);
  if (!found || !('validate' in found) || !found.validate) {
    throw new Error(`Missing step ${id}`);
  }
  return found;
}

describe('HubNamespaceAddUsers submit', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  beforeEach(() => {
    pageNavigate.mockClear();
    progressDialog.mockReset();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('validates the wizard steps, assigns users, and navigates away on cancel', async () => {
    progressDialog.mockImplementation(
      (options: {
        items: { user: { id?: number; username?: string }; role: { id: number; name: string } }[];
        keyFn: (item: { user: { id?: number }; role: { id: number } }) => string;
        actionColumns: {
          cell: (item: { user?: { username?: string }; role: { name: string } }) => string;
        }[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
        onClose: () => void;
      }) => {
        expect(options.items).toHaveLength(2);
        expect(options.keyFn(options.items[0])).toBe('2_3');
        expect(options.actionColumns[0].cell(options.items[0])).toBe('ada');
        expect(options.actionColumns[1].cell(options.items[0])).toBe('Publisher');
        options.actionFn(options.items[0]);
        options.onComplete();
        options.onClose();
      }
    );

    renderWizard();
    await waitFor(() => expect(screen.getByTestId('wizard-capture')).toBeInTheDocument());

    expect(() => {
      void step('users').validate?.({}, {});
    }).toThrow(/Select at least one user/);
    expect(() => {
      void step('users').validate?.({ users: [{ id: 2, username: 'ada' }] }, {});
    }).not.toThrow();
    expect(() => {
      void step('platformRoles').validate?.({}, {});
    }).toThrow(/Select at least one role/);
    expect(() => {
      void step('platformRoles').validate?.({ platformRoles: [{ id: 3, name: 'Publisher' }] }, {});
    }).not.toThrow();

    await wizardCapture.onSubmit?.({
      users: [{ id: 2, username: 'ada' }],
      platformRoles: [
        { id: 3, name: 'Publisher' },
        { id: 4, name: 'Admin' },
      ],
    });

    expect(progressDialog).toHaveBeenCalled();
    expect(pageNavigate).toHaveBeenCalledWith(HubRoute.NamespaceUserAccess, {
      params: { id: 'demo' },
    });

    pageNavigate.mockClear();
    wizardCapture.onCancel?.();
    expect(pageNavigate).toHaveBeenCalledWith(HubRoute.NamespaceUserAccess, {
      params: { id: 'demo' },
    });
  });

  it('submits assignments when the namespace lookup is empty', async () => {
    server.use(
      http.get('*/_ui/v1/namespaces/*', () =>
        HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      )
    );
    progressDialog.mockImplementation(
      (options: { onComplete: () => void; onClose: () => void }) => {
        options.onComplete();
        options.onClose();
      }
    );

    renderWizard();
    await waitFor(() => expect(screen.getByTestId('wizard-capture')).toBeInTheDocument());

    await wizardCapture.onSubmit?.({
      users: [{ id: 2, username: 'ada' }],
      platformRoles: [{ id: 3, name: 'Publisher' }],
    });

    expect(pageNavigate).toHaveBeenCalledWith(HubRoute.NamespaceUserAccess, {
      params: { id: undefined },
    });
  });
});
