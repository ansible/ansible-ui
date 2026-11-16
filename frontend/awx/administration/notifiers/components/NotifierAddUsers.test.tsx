import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NotifierAddUsers } from './NotifierAddUsers';

import {
  awxPageWizardCapture,
  awxPageWizardProgressDialog,
} from '../../../common/test/mockAwxPageWizard';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  const { createAwxPageWizardFrameworkMock } = await import(
    '../../../common/test/mockAwxPageWizard'
  );
  return createAwxPageWizardFrameworkMock(actual);
});

vi.mock('../../../common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => awxPageWizardProgressDialog,
}));

const mockNotifier = {
  id: 1,
  name: 'Test Notifier',
  type: 'notification_template',
  summary_fields: {},
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('notification_templates') && request.url.includes('/1/'),
    () => HttpResponse.json(mockNotifier)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/users'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.post(
    ({ request }) => request.url.includes('role_user_assignments'),
    () => HttpResponse.json({})
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  awxPageWizardProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('NotifierAddUsers', () => {
  it('validates users step and submits platform role assignments', async () => {
    awxPageWizardProgressDialog.mockImplementation(
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
      <MemoryRouter initialEntries={['/notification_templates/1/user-access/add']}>
        <Routes>
          <Route
            path="/notification_templates/:id/user-access/add"
            element={<NotifierAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const usersStep = awxPageWizardCapture.steps.find((step) => step.id === 'users');
    expect(() => {
      if (!usersStep || !('validate' in usersStep) || !usersStep.validate) {
        throw new Error('expected users step');
      }
      void usersStep.validate({}, {});
    }).toThrow(/Select at least one user/);

    if (!awxPageWizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await awxPageWizardCapture.onSubmit({
      users: [{ id: 2, username: 'user2' }],
      platformRoles: [{ id: 3, name: 'Admin' }],
    });

    expect(awxPageWizardProgressDialog).toHaveBeenCalled();
  });

  it('validates platform roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/notification_templates/1/user-access/add']}>
        <Routes>
          <Route
            path="/notification_templates/:id/user-access/add"
            element={<NotifierAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const rolesStep = awxPageWizardCapture.steps.find((step) => step.id === 'platformRoles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });
});
