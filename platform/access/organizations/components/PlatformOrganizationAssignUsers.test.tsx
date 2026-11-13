import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import { PlatformOrganizationAssignUsers } from './PlatformOrganizationAssignUsers';

const wizardCapture = vi.hoisted(() => ({
  onSubmit: undefined as ((data: unknown) => Promise<void>) | undefined,
  steps: [] as PageWizardStep[],
}));
const mockProgressDialog = vi.hoisted(() => vi.fn());
const mockPageNavigate = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageWizard: <T,>(props: { onSubmit: (data: T) => Promise<void>; steps: PageWizardStep[] }) => {
      wizardCapture.onSubmit = props.onSubmit as typeof wizardCapture.onSubmit;
      wizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('@ansible/awx-ui/common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => mockProgressDialog,
}));

const orgMemberRole = {
  id: 5,
  name: 'Organization Member',
  description: '',
  content_type: 'shared.organization',
};

const server = setupServer(
  http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
  http.get(gatewayAPI`/role_definitions/`, () =>
    HttpResponse.json({ count: 1, results: [orgMemberRole], next: null, previous: null })
  ),
  http.post(gatewayAPI`/role_user_assignments/`, () => HttpResponse.json({}))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  mockProgressDialog.mockClear();
  mockPageNavigate.mockClear();
});
afterAll(() => server.close());

describe('PlatformOrganizationAssignUsers', () => {
  function renderWizard() {
    return render(
      <MemoryRouter initialEntries={['/access/organizations/1/users/assign']}>
        <Routes>
          <Route
            path="/access/organizations/:id/users/assign"
            element={<PlatformOrganizationAssignUsers />}
          />
        </Routes>
      </MemoryRouter>
    );
  }

  it('validates users and roles wizard steps', async () => {
    renderWizard();

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

    const rolesStep = wizardCapture.steps.find((step) => step.id === 'roles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });

  it('submits organization member and selected roles via bulk dialog', async () => {
    mockProgressDialog.mockImplementation(
      (options: {
        items: unknown[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
      }) => {
        for (const item of options.items) {
          void options.actionFn(item);
        }
        options.onComplete();
      }
    );

    renderWizard();

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }

    await wizardCapture.onSubmit({
      users: [{ id: 2, username: 'user2' }],
      platformRoles: [{ id: 3, name: 'Custom Role' }],
    });

    expect(mockProgressDialog).toHaveBeenCalled();
    const dialogArg = mockProgressDialog.mock.calls[0][0] as {
      items: { role: { name: string } }[];
    };
    expect(dialogArg.items).toHaveLength(2);
    expect(dialogArg.items.map((item) => item.role.name)).toEqual(
      expect.arrayContaining(['Organization Member', 'Custom Role'])
    );
  });
});
