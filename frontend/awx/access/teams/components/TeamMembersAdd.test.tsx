import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { TeamMembersAdd } from './TeamMembersAdd';

const wizardCapture = vi.hoisted(() => ({
  onSubmit: undefined as ((data: unknown) => Promise<void>) | undefined,
  steps: [] as PageWizardStep[],
}));
const mockProgressDialog = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageWizard: <T,>(props: { onSubmit: (data: T) => Promise<void>; steps: PageWizardStep[] }) => {
      wizardCapture.onSubmit = props.onSubmit as typeof wizardCapture.onSubmit;
      wizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
  };
});

vi.mock('../../../common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => mockProgressDialog,
}));

const mockTeam = { id: 1, name: 'Engineering', type: 'team' };

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/teams/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockTeam)
  ),
  http.options(awxAPI`/users/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/users/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(awxAPI`/role_definitions/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/role_definitions/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.post(awxAPI`/role_user_assignments/`, () => HttpResponse.json({}))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('TeamMembersAdd', () => {
  it('validates users and roles steps then submits', async () => {
    mockProgressDialog.mockImplementation(
      (options: {
        items: unknown[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
      }) => {
        const item = options.items[0];
        if (item) {
          void options.actionFn(item);
        }
        options.onComplete();
      }
    );

    render(
      <MemoryRouter initialEntries={['/teams/1/user-access/add']}>
        <Routes>
          <Route path="/teams/:id/user-access/add" element={<TeamMembersAdd />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const usersStep = wizardCapture.steps.find((step) => step.id === 'users');
    expect(() => {
      if (!usersStep || !('validate' in usersStep) || !usersStep.validate) {
        throw new Error('expected users step');
      }
      void usersStep.validate({}, {});
    }).toThrow(/Select at least one user/);

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await wizardCapture.onSubmit({
      users: [{ id: 2, username: 'bob' }],
      awxRoles: [{ id: 3, name: 'Member' }],
    });

    expect(mockProgressDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Add users' })
    );
  });

  it('renders add users wizard for a team', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/1/user-access/add']}>
        <Routes>
          <Route path="/teams/:id/user-access/add" element={<TeamMembersAdd />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('shows loading spinner while team is loading', () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/teams/') && request.url.includes('/1/'),
        () => new Promise(() => {})
      )
    );
    render(
      <MemoryRouter initialEntries={['/teams/1/user-access/add']}>
        <Routes>
          <Route path="/teams/:id/user-access/add" element={<TeamMembersAdd />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('validates awx roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/1/user-access/add']}>
        <Routes>
          <Route path="/teams/:id/user-access/add" element={<TeamMembersAdd />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const rolesStep = wizardCapture.steps.find((step) => step.id === 'awxRoles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });
});
