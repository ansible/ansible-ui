import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  CredentialsExternalTestModal,
  type CredentialsExternalTestModalProps,
} from './CredentialsExternalTestModal';

const centrifyCredentialType = {
  id: 1,
  type: 'credential_type',
  name: 'Centrify Vault',
  description: '',
  kind: 'external' as const,
  namespace: 'test',
  managed: false,
  inputs: {
    fields: [
      { id: 'url', type: 'string', label: 'URL', secret: false, help_text: '' },
      { id: 'client-id', type: 'string', label: 'Client ID', secret: false, help_text: '' },
      {
        id: 'client-password',
        type: 'string',
        label: 'Client Password',
        secret: true,
        help_text: '',
      },
    ],
    metadata: [
      { id: 'account-name', type: 'string', label: 'Account Name', secret: false, help_text: '' },
      { id: 'system-name', type: 'string', label: 'System Name', secret: false, help_text: '' },
    ],
    required: ['account-name', 'system-name'],
  },
  injectors: {},
  related: { credentials: '/api/v2/credentials/', activity_stream: '/api/v2/activity_stream/' },
  summary_fields: { user_capabilities: { edit: false, delete: false } },
};

const credentialTypeWithSelect = {
  ...centrifyCredentialType,
  id: 2,
  inputs: {
    ...centrifyCredentialType.inputs,
    metadata: [
      { id: 'account-name', type: 'string', label: 'Account Name', secret: false, help_text: '' },
      {
        id: 'format',
        type: 'string',
        label: 'Format',
        secret: false,
        help_text: '',
        choices: ['json', 'yaml'],
      },
    ],
    required: ['account-name'],
  },
};

function mockAlertToaster(addAlert = vi.fn()) {
  return {
    addAlert,
    removeAlert: vi.fn(),
    replaceAlert: vi.fn(),
    removeAlerts: vi.fn(),
  };
}

const defaultProps = {
  credentialType: centrifyCredentialType,
  watchedSubFormFields: ['http://foo.com', 'client-id', 'client-secret'],
  popDialog: vi.fn(),
  alertToaster: mockAlertToaster(),
};

const server = setupServer(
  http.post(
    ({ request }) => request.url.includes('/credential_types/') && request.url.includes('/test/'),
    () => HttpResponse.json({}, { status: 200 })
  ),
  http.post(
    ({ request }) => request.url.includes('/credentials/') && request.url.includes('/test/'),
    () => HttpResponse.json({}, { status: 200 })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderModal(props: Partial<typeof defaultProps & CredentialsExternalTestModalProps> = {}) {
  return render(
    <MemoryRouter>
      <CredentialsExternalTestModal {...{ ...defaultProps, ...props }} />
    </MemoryRouter>
  );
}

describe('CredentialsExternalTestModal', () => {
  it('should render modal with title and form fields', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Test external credential' })).toBeInTheDocument();
    expect(screen.getByText('Account Name')).toBeInTheDocument();
    expect(screen.getByText('System Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call popDialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const popDialog = vi.fn();
    renderModal({ popDialog });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(popDialog).toHaveBeenCalled();
  });

  it('should submit to credential_types test endpoint when no credential and show success alert', async () => {
    const user = userEvent.setup();
    const addAlert = vi.fn();
    renderModal({ alertToaster: mockAlertToaster(addAlert) });

    await user.type(screen.getByTestId('account-name'), 'test-account');
    await user.type(screen.getByTestId('system-name'), 'test-system');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    await waitFor(() => {
      expect(addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
          title: 'Test passed.',
        })
      );
    });
  });

  it('should submit to credentials test endpoint when credential exists', async () => {
    const user = userEvent.setup();
    const addAlert = vi.fn();
    server.use(
      http.post(awxAPI`/credentials/35/test/`, () => HttpResponse.json({}, { status: 200 }))
    );

    renderModal({
      credential: {
        id: 35,
        type: 'credential',
        name: 'Test',
        description: '',
        credential_type: 1,
        inputs: {},
        summary_fields: { credential_type: { id: 1, name: 'Centrify' }, user_capabilities: {} },
      } as CredentialsExternalTestModalProps['credential'],
      alertToaster: mockAlertToaster(addAlert),
    });

    await user.type(screen.getByTestId('account-name'), 'test-account');
    await user.type(screen.getByTestId('system-name'), 'test-system');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    await waitFor(() => {
      expect(addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
          title: 'Test passed.',
        })
      );
    });
  });

  it('should show error alert when API request fails', async () => {
    const user = userEvent.setup();
    const addAlert = vi.fn();
    server.use(
      http.post(
        ({ request }) =>
          request.url.includes('/credential_types/') && request.url.includes('/test/'),
        () => HttpResponse.json({ detail: 'Connection failed' }, { status: 500 })
      )
    );

    renderModal({ alertToaster: mockAlertToaster(addAlert) });

    await user.type(screen.getByTestId('account-name'), 'test-account');
    await user.type(screen.getByTestId('system-name'), 'test-system');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    await waitFor(() => {
      expect(addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Something went wrong with the request to test this credential.',
        })
      );
    });
  });

  it('should render select field when metadata has choices', () => {
    renderModal({ credentialType: credentialTypeWithSelect });

    expect(screen.getByText('Account Name')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
  });
});
