import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { OrganizationAssignTeams } from './OrganizationAssignTeams';

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

vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: vi.fn(() => Promise.resolve({})),
}));

const mockOrganization = {
  id: 1,
  name: 'Test Org',
  description: '',
  custom_virtualenv: null,
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/organizations/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockOrganization)
  ),
  http.options(
    ({ request }) => request.url.includes('/teams/') && !request.url.includes('organizations'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/teams/') && !request.url.includes('organizations'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('OrganizationAssignTeams', () => {
  it('validates teams step and submits assignments', async () => {
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
      <MemoryRouter initialEntries={['/organizations/1/team-access/assign']}>
        <Routes>
          <Route
            path="/organizations/:id/team-access/assign"
            element={<OrganizationAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const teamsStep = wizardCapture.steps.find((step) => step.id === 'teams');
    expect(() => {
      if (!teamsStep || !('validate' in teamsStep) || !teamsStep.validate) {
        throw new Error('expected teams step');
      }
      void teamsStep.validate({}, {});
    }).toThrow(/Select at least one team/);

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await wizardCapture.onSubmit({
      teams: [{ id: 2, name: 'Ops' }],
      awxRoles: [{ id: 3, name: 'Member' }],
    });

    expect(mockProgressDialog).toHaveBeenCalled();
  });
});
