/* eslint-disable i18next/no-literal-string */
import { IPageAlertToaster } from '@ansible/ansible-ui-framework';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { CredentialTestResponse } from '../../../../interfaces/CredentialTestResponse';
import { CredentialPluginsModal, CredentialPluginsModalProps } from './useCredentialPluginsDialog';

function TestWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </SWRConfig>
  );
}

const mockCredential = {
  id: 10,
  name: 'Test External Credential',
  credential_type: 10,
  summary_fields: {
    credential_type: { id: 10, name: 'Custom External', namespace: 'custom-external' },
  },
};

const mockCredentialType = {
  id: 10,
  name: 'Custom External',
  namespace: 'custom-external',
  inputs: {
    fields: [],
    metadata: [{ id: 'api-key', type: 'string', label: 'API Key', secret: false }],
    required: ['api-key'],
  },
};

const mockJwtSuccessResponse: CredentialTestResponse = {
  status: 'success',
  details: {
    sent_jwt_payload: {
      iss: 'https://test.example.com',
      sub: 'test-user',
      aud: 'test-audience',
      exp: 1234567890,
      iat: 1234567800,
    },
  },
};

const mockJwtFailedResponse: CredentialTestResponse = {
  status: 'failed',
  details: {
    sent_jwt_payload: {
      iss: 'https://test.example.com',
      sub: 'test-user',
    },
  },
};

const mockNonJwtSuccessResponse: CredentialTestResponse = {
  status: 'success',
};

const mockNonJwtFailedResponse: CredentialTestResponse = {
  status: 'failed',
};

const server = setupServer(
  http.get(awxAPI`/credentials/10/`, () => HttpResponse.json(mockCredential)),
  http.get(awxAPI`/credential_types/10/`, () => HttpResponse.json(mockCredentialType)),
  http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtSuccessResponse)),
  http.options(awxAPI`/credentials/`, () =>
    HttpResponse.json({
      actions: { GET: { credential_type__kind: { choices: [['external', 'External']] } } },
    })
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/credentials/') && !request.url.match(/\/credentials\/\d+\//),
    () =>
      HttpResponse.json({
        count: 1,
        results: [mockCredential],
        next: null,
        previous: null,
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createMockAlertToaster(): IPageAlertToaster {
  return {
    addAlert: vi.fn(),
    removeAlert: vi.fn(),
    replaceAlert: vi.fn(),
    removeAlerts: vi.fn(),
  };
}

function createDefaultProps(
  overrides?: Partial<CredentialPluginsModalProps & { alertToaster: IPageAlertToaster }>
): CredentialPluginsModalProps & { alertToaster: IPageAlertToaster } {
  return {
    field: { id: 'test-field', label: 'Test Field', type: 'string', secret: false, help_text: '' },
    setCredentialPluginValues: vi.fn(),
    onClose: vi.fn(),
    accumulatedPluginValues: [
      {
        input_field_name: 'test-field',
        source_credential: 10,
        metadata: { 'api-key': 'test-key' },
      },
    ],
    alertToaster: createMockAlertToaster(),
    ...overrides,
  };
}

function renderModal(
  overrides?: Partial<CredentialPluginsModalProps & { alertToaster: IPageAlertToaster }>
) {
  const props = createDefaultProps(overrides);
  const result = render(
    <TestWrapper>
      <CredentialPluginsModal {...props} />
    </TestWrapper>
  );
  return { props, ...result };
}

describe('CredentialPluginsModal', () => {
  describe('initial rendering', () => {
    it('should render modal with "Credential Plugins" title', async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByText('Credential Plugins')).toBeInTheDocument();
      });
    });

    it('should render the form when there is no test response', async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByText('Secret Management System')).toBeInTheDocument();
      });
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    it('should load default values from accumulatedPluginValues', async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });
    });

    it('should render without default values when no matching plugin values', async () => {
      renderModal({
        accumulatedPluginValues: [
          {
            input_field_name: 'other-field',
            source_credential: 10,
            metadata: { 'api-key': 'test-key' },
          },
        ],
      });

      await waitFor(() => {
        expect(screen.getByText('Secret Management System')).toBeInTheDocument();
      });
    });

    it('should render without accumulatedPluginValues', async () => {
      renderModal({ accumulatedPluginValues: undefined });

      await waitFor(() => {
        expect(screen.getByText('Secret Management System')).toBeInTheDocument();
      });
    });
  });

  describe('handleSubmit', () => {
    it('should call setCredentialPluginValues and close modal on form submit', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const finishButton = screen.getByRole('button', { name: 'Finish' });
      await user.click(finishButton);

      await waitFor(() => {
        expect(props.setCredentialPluginValues).toHaveBeenCalledWith([
          expect.objectContaining({
            input_field_name: 'test-field',
            source_credential: 10,
          }),
        ]);
      });
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  describe('handleTest - JWT payload responses', () => {
    it('should display JWT payload view on success with JWT response', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtSuccessResponse))
      );

      renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });
      expect(screen.getByText('Test passed.')).toBeInTheDocument();
      expect(
        screen.getByText('JWT claims associated to the Controller job template:')
      ).toBeInTheDocument();
      expect(screen.getByText(/test-user/)).toBeInTheDocument();
    });

    it('should display error alert on failure with JWT response', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtFailedResponse))
      );

      renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });
      expect(
        screen.getByText('Something went wrong with the request to test this credential.')
      ).toBeInTheDocument();
    });

    it('should show Close button on JWT success', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtSuccessResponse))
      );

      const { props } = renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });

      const footer = document.querySelector('.pf-v6-c-modal-box__footer') as HTMLElement;
      const closeButton = within(footer).getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(props.onClose).toHaveBeenCalled();
    });

    it('should show Retry and Cancel buttons on JWT failure', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtFailedResponse))
      );

      renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('handleTest - non-JWT responses', () => {
    it('should show success toast and close on non-JWT success', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockNonJwtSuccessResponse))
      );

      const { props } = renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(props.alertToaster.addAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'success',
            title: 'Test passed.',
          })
        );
      });
      expect(props.onClose).toHaveBeenCalled();
    });

    it('should show failure toast and stay open on non-JWT failure', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockNonJwtFailedResponse))
      );

      const { props } = renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(props.alertToaster.addAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
            title: 'Test failed.',
          })
        );
      });
      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  describe('handleTest - error handling', () => {
    it('should display JWT view when error response contains JWT payload', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () =>
          HttpResponse.json(mockJwtFailedResponse, { status: 400 })
        )
      );

      renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });
      expect(
        screen.getByText('Something went wrong with the request to test this credential.')
      ).toBeInTheDocument();
    });

    it('should show error toast for generic errors', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () =>
          HttpResponse.json({ error: 'Server error' }, { status: 500 })
        )
      );

      const { props } = renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(props.alertToaster.addAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
            title: 'Something went wrong with the request to test this credential.',
          })
        );
      });
    });
  });

  describe('Retry functionality', () => {
    it('should go back to form view when Retry is clicked', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtFailedResponse))
      );

      renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Credential Plugins')).toBeInTheDocument();
      });
      expect(screen.getByText('Secret Management System')).toBeInTheDocument();
    });

    it('should close modal when Cancel is clicked on JWT failure view', async () => {
      const user = userEvent.setup();
      server.use(
        http.post(awxAPI`/credentials/10/test/`, () => HttpResponse.json(mockJwtFailedResponse))
      );

      const { props } = renderModal();

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('Payload of JWT')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(props.onClose).toHaveBeenCalled();
    });
  });

  describe('handleTest with job_template_id', () => {
    it('should include job_template_id in test payload when present', async () => {
      const user = userEvent.setup();
      let capturedPayload: Record<string, unknown> | null = null;
      server.use(
        http.post(awxAPI`/credentials/10/test/`, async ({ request }) => {
          capturedPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(mockNonJwtSuccessResponse);
        })
      );

      renderModal({
        accumulatedPluginValues: [
          {
            input_field_name: 'test-field',
            source_credential: 10,
            metadata: { 'api-key': 'test-key', job_template_id: 42 },
          },
        ],
      });

      await waitFor(() => {
        expect(screen.getByText('API Key')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: 'Test' });
      await waitFor(() => {
        expect(testButton).not.toBeDisabled();
      });
      await user.click(testButton);

      await waitFor(() => {
        expect(capturedPayload).not.toBeNull();
        const metadata = (capturedPayload as Record<string, unknown>)['metadata'] as Record<
          string,
          unknown
        >;
        expect(metadata['api-key']).toBe('test-key');
        expect(metadata['job_template_id']).toBe(42);
      });
    });
  });
});
