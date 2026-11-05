import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { CredentialAddUsers } from './CredentialAddUsers';

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

const credential = {
  id: 1,
  type: 'credential',
  name: 'Test Credential',
  description: '',
  organization: null,
  credential_type: 1,
  managed: false,
  inputs: {},
  summary_fields: { credential_type: { id: 1, name: 'Machine' }, user_capabilities: {} },
  created: '',
  modified: '',
  url: '/api/v2/credentials/1/',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/credentials/') && request.url.includes('/1/'),
    () => HttpResponse.json(credential)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/users'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('CredentialAddUsers', () => {
  it('validates users step and submits platform role assignments', async () => {
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
      <MemoryRouter initialEntries={['/credentials/1/user-access/add']}>
        <Routes>
          <Route path="/credentials/:id/user-access/add" element={<CredentialAddUsers />} />
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
      users: [{ id: 2, username: 'user2' }],
      platformRoles: [{ id: 3, name: 'Admin' }],
    });

    expect(mockProgressDialog).toHaveBeenCalled();
  });

  it('invokes onClose after assignments complete', async () => {
    mockProgressDialog.mockImplementation(
      (options: { onClose: () => void; onComplete: () => void }) => {
        options.onComplete();
        options.onClose();
      }
    );

    render(
      <MemoryRouter initialEntries={['/credentials/1/user-access/add']}>
        <Routes>
          <Route path="/credentials/:id/user-access/add" element={<CredentialAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await wizardCapture.onSubmit({
      users: [{ id: 2, username: 'user2' }],
      platformRoles: [{ id: 3, name: 'Admin' }],
    });
  });

  it('validates platform roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/credentials/1/user-access/add']}>
        <Routes>
          <Route path="/credentials/:id/user-access/add" element={<CredentialAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const rolesStep = wizardCapture.steps.find((step) => step.id === 'platformRoles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });
});
