import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { AddRolesToUser } from './AddRolesToUser';

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

const user = {
  id: 1,
  type: 'user',
  url: '/api/v2/users/1/',
  username: 'testuser',
  email: 'test@example.com',
  first_name: '',
  last_name: '',
  is_superuser: false,
  is_system_auditor: false,
  created: '',
  modified: '',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/users/') && request.url.includes('/1/'),
    () => HttpResponse.json(user)
  ),
  http.options(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('AddRolesToUser', () => {
  it('validates wizard steps and submits assignments', async () => {
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
      <MemoryRouter initialEntries={['/users/1/roles/add-roles']}>
        <Routes>
          <Route path="/users/:id/roles/add-roles" element={<AddRolesToUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Add roles');
    });

    const resourcesStep = wizardCapture.steps.find((step) => step.id === 'resources');
    expect(() => {
      if (!resourcesStep || !('validate' in resourcesStep) || !resourcesStep.validate) {
        throw new Error('expected resources step');
      }
      void resourcesStep.validate({}, {});
    }).toThrow(/Select at least one resource/);

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await wizardCapture.onSubmit({
      resourceType: 'awx.project',
      resources: [{ id: 10, name: 'Demo' }],
      awxRoles: [{ id: 11, name: 'Use' }],
    });

    expect(mockProgressDialog).toHaveBeenCalled();
  });
});
