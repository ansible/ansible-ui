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
  ),
  // Mock job templates API for PageFormJobTemplateSelect
  http.options('*/job_templates/', () => HttpResponse.json({}, { status: 200 })),
  http.get('*/job_templates/', () =>
    HttpResponse.json({
      count: 2,
      results: [
        {
          id: 1,
          name: 'Demo Job Template',
          type: 'job_template',
          url: '/api/v2/job_templates/1/',
        },
        {
          id: 2,
          name: 'Test Job Template',
          type: 'job_template',
          url: '/api/v2/job_templates/2/',
        },
      ],
    })
  ),
  // Also mock unified_job_templates endpoint
  http.options('*/unified_job_templates/', () => HttpResponse.json({}, { status: 200 })),
  http.get('*/unified_job_templates/', () =>
    HttpResponse.json({
      count: 2,
      results: [
        {
          id: 1,
          name: 'Demo Job Template',
          type: 'job_template',
          url: '/api/v2/job_templates/1/',
        },
        {
          id: 2,
          name: 'Test Job Template',
          type: 'job_template',
          url: '/api/v2/job_templates/2/',
        },
      ],
    })
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

  describe('OIDC credential behavior', () => {
    it(
      'should display JWT payload when response includes sent_jwt_payload',
      { timeout: 10000 },
      async () => {
        const user = userEvent.setup();
        const popDialog = vi.fn();

        // Mock response with JWT payload
        const responseWithJwt = {
          status: 'success',
          details: {
            sent_jwt_payload: {
              aap_controller_organization_name: 'Default',
              aap_controller_job_template_name: 'Demo Job Template',
              jti: 'test',
              iss: 'http://example.com/o/',
              sub: 'job::organization:Default:project::job_template:Demo Job Template',
              aud: 'test',
              exp: 9999999999.99999,
              iat: 9999999999.99999,
            },
          },
        };

        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/credential_types/') && request.url.includes('/test/'),
            () => HttpResponse.json(responseWithJwt, { status: 200 })
          )
        );

        // Use OIDC credential type (JWT payload only displays for OIDC credentials)
        const oidcType = {
          ...centrifyCredentialType,
          namespace: 'hashivault-kv-oidc',
        };

        renderModal({ credentialType: oidcType, popDialog });

        // Fill in required fields
        await user.type(screen.getByTestId('account-name'), 'test-account');
        await user.type(screen.getByTestId('system-name'), 'test-system');

        // Select a job template (required for OIDC credentials)
        await user.click(screen.getByTestId('job-template-select'));
        await waitFor(() => {
          expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Demo Job Template'));

        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Run' }));

        // Verify modal title changes to JWT payload view
        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: 'Payload of JWT' })).toBeInTheDocument();
        });

        // Verify success alert is displayed
        expect(screen.getByText('Test passed.')).toBeInTheDocument();

        // Verify JWT payload description
        expect(
          screen.getByText('JWT claims associated to the Controller job template:')
        ).toBeInTheDocument();

        // Verify JWT fields are displayed in code block
        expect(screen.getByText(/test/)).toBeInTheDocument();
        expect(screen.getByText(/http:\/\/example.com\/o\//)).toBeInTheDocument();

        // Verify Close button is shown in footer (not Run button)
        const closeButtons = screen.getAllByRole('button', { name: 'Close' });
        expect(closeButtons.length).toBeGreaterThan(0);
        expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();

        // Verify modal does NOT auto-close
        expect(popDialog).not.toHaveBeenCalled();
      }
    );

    it(
      'should display JWT payload with failure alert when test fails',
      { timeout: 10000 },
      async () => {
        const user = userEvent.setup();
        const popDialog = vi.fn();

        const responseWithJwt = {
          details: {
            sent_jwt_payload: {
              aap_controller_organization_name: 'Default',
              aap_controller_job_template_name: 'Demo Job Template',
              jti: 'test',
              iss: 'http://example.com/o/',
              sub: 'job::organization:Default:project::job_template:Demo Job Template',
              aud: 'test',
              exp: 9999999999.99999,
              iat: 9999999999.99999,
            },
          },
        };

        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/credential_types/') && request.url.includes('/test/'),
            () => HttpResponse.json(responseWithJwt, { status: 500 })
          )
        );

        const oidcType = {
          ...centrifyCredentialType,
          namespace: 'hashivault-kv-oidc',
        };

        renderModal({ credentialType: oidcType, popDialog });

        await user.type(screen.getByTestId('account-name'), 'test-account');
        await user.type(screen.getByTestId('system-name'), 'test-system');

        await user.click(screen.getByTestId('job-template-select'));
        await waitFor(() => {
          expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Demo Job Template'));

        await user.click(screen.getByRole('button', { name: 'Run' }));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: 'Payload of JWT' })).toBeInTheDocument();
        });

        // Verify failure alert is displayed
        expect(
          screen.getByText('Something went wrong with the request to test this credential.')
        ).toBeInTheDocument();

        // Verify JWT payload is still shown
        expect(
          screen.getByText('JWT claims associated to the Controller job template:')
        ).toBeInTheDocument();
        expect(screen.getByText(/http:\/\/example.com\/o\//)).toBeInTheDocument();

        // Verify Retry button is shown in footer (not Run)
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();

        // Verify modal does NOT auto-close
        expect(popDialog).not.toHaveBeenCalled();
      }
    );

    it(
      'should reset to form view when Retry is clicked after failure',
      { timeout: 10000 },
      async () => {
        const user = userEvent.setup();
        const popDialog = vi.fn();

        const responseWithJwt = {
          details: {
            sent_jwt_payload: {
              aap_controller_organization_name: 'Default',
              aap_controller_job_template_name: 'Demo Job Template',
              jti: 'test',
              iss: 'http://example.com/o/',
              sub: 'job::organization:Default:project::job_template:Demo Job Template',
              aud: 'test',
              exp: 9999999999.99999,
              iat: 9999999999.99999,
            },
          },
        };

        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/credential_types/') && request.url.includes('/test/'),
            () => HttpResponse.json(responseWithJwt, { status: 500 })
          )
        );

        const oidcType = {
          ...centrifyCredentialType,
          namespace: 'hashivault-kv-oidc',
        };

        renderModal({ credentialType: oidcType, popDialog });

        await user.type(screen.getByTestId('account-name'), 'test-account');
        await user.type(screen.getByTestId('system-name'), 'test-system');

        await user.click(screen.getByTestId('job-template-select'));
        await waitFor(() => {
          expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Demo Job Template'));

        await user.click(screen.getByRole('button', { name: 'Run' }));

        // Wait for failure JWT payload view
        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: 'Payload of JWT' })).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();

        // Click Retry
        await user.click(screen.getByRole('button', { name: 'Retry' }));

        // Verify modal resets to form view
        await waitFor(() => {
          expect(
            screen.getByRole('dialog', { name: 'Test external credential' })
          ).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
        expect(screen.getByText('Account Name')).toBeInTheDocument();
        expect(screen.getByText('Controller Job Template')).toBeInTheDocument();
      }
    );

    it(
      'should show error toast when OIDC credential test fails without JWT payload',
      { timeout: 10000 },
      async () => {
        const user = userEvent.setup();
        const addAlert = vi.fn();
        const popDialog = vi.fn();

        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/credential_types/') && request.url.includes('/test/'),
            () => HttpResponse.json({ inputs: 'Connection refused' }, { status: 500 })
          )
        );

        const oidcType = {
          ...centrifyCredentialType,
          namespace: 'hashivault-kv-oidc',
        };

        renderModal({
          credentialType: oidcType,
          alertToaster: mockAlertToaster(addAlert),
          popDialog,
        });

        await user.type(screen.getByTestId('account-name'), 'test-account');
        await user.type(screen.getByTestId('system-name'), 'test-system');

        await user.click(screen.getByTestId('job-template-select'));
        await waitFor(() => {
          expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Demo Job Template'));

        await user.click(screen.getByRole('button', { name: 'Run' }));

        await waitFor(() => {
          expect(addAlert).toHaveBeenCalledWith(
            expect.objectContaining({
              variant: 'danger',
              title: 'Something went wrong with the request to test this credential.',
            })
          );
        });

        // Verify JWT payload UI is NOT displayed
        expect(
          screen.queryByText('JWT claims associated to the Controller job template:')
        ).not.toBeInTheDocument();
      }
    );

    it(
      'should show success toast when OIDC credential test succeeds without JWT payload',
      { timeout: 10000 },
      async () => {
        const user = userEvent.setup();
        const addAlert = vi.fn();
        const popDialog = vi.fn();

        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/credential_types/') && request.url.includes('/test/'),
            () => HttpResponse.json({}, { status: 200 })
          )
        );

        const oidcType = {
          ...centrifyCredentialType,
          namespace: 'hashivault-kv-oidc',
        };

        renderModal({
          credentialType: oidcType,
          alertToaster: mockAlertToaster(addAlert),
          popDialog,
        });

        await user.type(screen.getByTestId('account-name'), 'test-account');
        await user.type(screen.getByTestId('system-name'), 'test-system');

        await user.click(screen.getByTestId('job-template-select'));
        await waitFor(() => {
          expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Demo Job Template'));

        await user.click(screen.getByRole('button', { name: 'Run' }));

        await waitFor(() => {
          expect(addAlert).toHaveBeenCalledWith(
            expect.objectContaining({
              variant: 'success',
              title: 'Test passed.',
            })
          );
        });

        // Verify modal auto-closes
        expect(popDialog).toHaveBeenCalled();

        // Verify JWT payload UI is NOT displayed
        expect(
          screen.queryByText('JWT claims associated to the Controller job template:')
        ).not.toBeInTheDocument();
      }
    );

    it(
      'should display JWT payload for hashivault-ssh-oidc credentials',
      { timeout: 10000 },
      async () => {
        const user = userEvent.setup();
        const popDialog = vi.fn();

        const responseWithJwt = {
          status: 'success',
          details: {
            sent_jwt_payload: {
              aap_controller_organization_name: 'Default',
              aap_controller_job_template_name: 'Demo Job Template',
              jti: 'test',
              iss: 'http://example.com/o/',
              sub: 'job::organization:Default:project::job_template:Demo Job Template',
              aud: 'test',
              exp: 9999999999.99999,
              iat: 9999999999.99999,
            },
          },
        };

        server.use(
          http.post(
            ({ request }) =>
              request.url.includes('/credential_types/') && request.url.includes('/test/'),
            () => HttpResponse.json(responseWithJwt, { status: 200 })
          )
        );

        const oidcSshType = {
          ...centrifyCredentialType,
          namespace: 'hashivault-ssh-oidc',
        };

        renderModal({ credentialType: oidcSshType, popDialog });

        await user.type(screen.getByTestId('account-name'), 'test-account');
        await user.type(screen.getByTestId('system-name'), 'test-system');

        await user.click(screen.getByTestId('job-template-select'));
        await waitFor(() => {
          expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Demo Job Template'));

        await user.click(screen.getByRole('button', { name: 'Run' }));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: 'Payload of JWT' })).toBeInTheDocument();
        });

        expect(screen.getByText('Test passed.')).toBeInTheDocument();
        expect(
          screen.getByText('JWT claims associated to the Controller job template:')
        ).toBeInTheDocument();
      }
    );

    it('should show toast notification for non-OIDC credentials', async () => {
      const user = userEvent.setup();
      const addAlert = vi.fn();
      const popDialog = vi.fn();

      renderModal({
        credentialType: centrifyCredentialType,
        alertToaster: mockAlertToaster(addAlert),
        popDialog,
      });

      // Verify Controller Job Template field is NOT rendered
      expect(screen.queryByText('Controller Job Template')).not.toBeInTheDocument();

      // Fill in required fields
      await user.type(screen.getByTestId('account-name'), 'test-account');
      await user.type(screen.getByTestId('system-name'), 'test-system');

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Run' }));

      // Verify toast alert is shown
      await waitFor(() => {
        expect(addAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'success',
            title: 'Test passed.',
          })
        );
      });

      // Verify modal auto-closes
      expect(popDialog).toHaveBeenCalled();

      // Verify JWT payload UI is NOT displayed
      expect(
        screen.queryByText('JWT claims associated to the Controller job template:')
      ).not.toBeInTheDocument();
    });
  });

  describe('Credential configuration preservation', () => {
    it('should send current form values when testing existing credential with unsaved changes', async () => {
      const user = userEvent.setup();
      let capturedPayload: {
        inputs: Record<string, unknown>;
        metadata: Record<string, string>;
      } | null = null;

      server.use(
        http.post(awxAPI`/credentials/42/test/`, async ({ request }: { request: Request }) => {
          capturedPayload = (await request.json()) as {
            inputs: Record<string, unknown>;
            metadata: Record<string, string>;
          };
          return HttpResponse.json({}, { status: 200 });
        })
      );

      const credTypeWithSecretField = {
        ...centrifyCredentialType,
        inputs: {
          fields: [
            { id: 'url', type: 'string', label: 'URL', secret: false, help_text: '' },
            { id: 'api_key', type: 'string', label: 'API Key', secret: true, help_text: '' },
            {
              id: 'verify',
              type: 'boolean',
              label: 'Verify SSL',
              secret: false,
              help_text: '',
              default: true,
            },
          ],
          metadata: [
            { id: 'object-query', type: 'string', label: 'Query', secret: false, help_text: '' },
          ],
          required: ['url', 'object-query'],
        },
      };

      const existingCred = {
        id: 42,
        type: 'credential',
        name: 'Test',
        description: '',
        credential_type: 1,
        inputs: { url: 'https://old.com', api_key: 'secret', verify: true }, // saved values
        summary_fields: {
          credential_type: { id: 1, name: 'CCP' },
          user_capabilities: {},
        },
      } as unknown as CredentialsExternalTestModalProps['credential'];

      // User changed url and verify in the form, but didn't save yet
      // api_key shows as '$encrypted$' placeholder (not modified)
      renderModal({
        credential: existingCred,
        credentialType: credTypeWithSecretField,
        watchedSubFormFields: ['https://new.com', '$encrypted$', false],
      } as Partial<typeof defaultProps & CredentialsExternalTestModalProps>);

      await user.type(screen.getByTestId('object-query'), 'test');
      await user.click(screen.getByRole('button', { name: 'Run' }));

      await waitFor(() => expect(capturedPayload).toBeDefined());

      // Should send current form values (including unsaved changes)
      expect(capturedPayload!.inputs.url).toBe('https://new.com'); // changed
      expect(capturedPayload!.inputs.verify).toBe(false); // changed
      expect(capturedPayload!.inputs.api_key).toBe('$encrypted$'); // unchanged secret
      expect(capturedPayload!.metadata['object-query']).toBe('test');
    });

    it('should send current form values when testing new credential type', async () => {
      const user = userEvent.setup();
      let capturedPayload: {
        inputs: Record<string, unknown>;
        metadata: Record<string, string>;
      } | null = null;

      server.use(
        http.post(
          ({ request }: { request: Request }) =>
            request.url.includes('/credential_types/') && request.url.includes('/test/'),
          async ({ request }: { request: Request }) => {
            capturedPayload = (await request.json()) as {
              inputs: Record<string, unknown>;
              metadata: Record<string, string>;
            };
            return HttpResponse.json({}, { status: 200 });
          }
        )
      );

      const credTypeWithVerify = {
        ...centrifyCredentialType,
        inputs: {
          fields: [
            { id: 'url', type: 'string', label: 'URL', secret: false, help_text: '' },
            {
              id: 'verify',
              type: 'boolean',
              label: 'Verify SSL',
              secret: false,
              help_text: '',
              default: true,
            },
          ],
          metadata: [
            { id: 'object-query', type: 'string', label: 'Query', secret: false, help_text: '' },
          ],
          required: ['url', 'object-query'],
        },
      };

      renderModal({
        credentialType: credTypeWithVerify,
        watchedSubFormFields: ['https://example.com', true],
      } as Partial<typeof defaultProps & CredentialsExternalTestModalProps>);

      await user.type(screen.getByTestId('object-query'), 'test');
      await user.click(screen.getByRole('button', { name: 'Run' }));

      await waitFor(() => expect(capturedPayload).toBeDefined());

      // Should send inputs with current form values
      expect(capturedPayload!.inputs).toBeDefined();
      expect(capturedPayload!.inputs.url).toBe('https://example.com');
      expect(capturedPayload!.inputs.verify).toBe(true);
      expect(capturedPayload!.metadata['object-query']).toBe('test');
    });

    it('should properly handle false values in watched fields when testing new credential', async () => {
      const user = userEvent.setup();
      let capturedPayload: {
        inputs: Record<string, unknown>;
        metadata: Record<string, string>;
      } | null = null;

      server.use(
        http.post(
          ({ request }: { request: Request }) =>
            request.url.includes('/credential_types/') && request.url.includes('/test/'),
          async ({ request }: { request: Request }) => {
            capturedPayload = (await request.json()) as {
              inputs: Record<string, unknown>;
              metadata: Record<string, string>;
            };
            return HttpResponse.json({}, { status: 200 });
          }
        )
      );

      const credTypeWithVerify = {
        ...centrifyCredentialType,
        inputs: {
          fields: [
            { id: 'url', type: 'string', label: 'URL', secret: false, help_text: '' },
            {
              id: 'verify',
              type: 'boolean',
              label: 'Verify SSL',
              secret: false,
              help_text: '',
              default: true,
            },
          ],
          metadata: [
            { id: 'object-query', type: 'string', label: 'Query', secret: false, help_text: '' },
          ],
          required: ['url', 'object-query'],
        },
      };

      // User unchecked "Verify SSL" - watchedSubFormFields contains false
      renderModal({
        credentialType: credTypeWithVerify,
        watchedSubFormFields: ['https://example.com', false],
      } as Partial<typeof defaultProps & CredentialsExternalTestModalProps>);

      await user.type(screen.getByTestId('object-query'), 'test');
      await user.click(screen.getByRole('button', { name: 'Run' }));

      await waitFor(() => expect(capturedPayload).toBeDefined());

      // Should send verify: false, not fall back to default value of true
      expect(capturedPayload!.inputs).toBeDefined();
      expect(capturedPayload!.inputs.url).toBe('https://example.com');
      expect(capturedPayload!.inputs.verify).toBe(false);
      expect(capturedPayload!.metadata['object-query']).toBe('test');
    });

    it('should use default value when watched field is undefined', async () => {
      const user = userEvent.setup();
      let capturedPayload: {
        inputs: Record<string, unknown>;
        metadata: Record<string, string>;
      } | null = null;

      server.use(
        http.post(
          ({ request }: { request: Request }) =>
            request.url.includes('/credential_types/') && request.url.includes('/test/'),
          async ({ request }: { request: Request }) => {
            capturedPayload = (await request.json()) as {
              inputs: Record<string, unknown>;
              metadata: Record<string, string>;
            };
            return HttpResponse.json({}, { status: 200 });
          }
        )
      );

      const credTypeWithDefault = {
        ...centrifyCredentialType,
        inputs: {
          fields: [
            { id: 'url', type: 'string', label: 'URL', secret: false, help_text: '' },
            {
              id: 'verify',
              type: 'boolean',
              label: 'Verify SSL',
              secret: false,
              help_text: '',
              default: true,
            },
          ],
          metadata: [
            { id: 'object-query', type: 'string', label: 'Query', secret: false, help_text: '' },
          ],
          required: ['url', 'object-query'],
        },
      };

      // Only provide value for first field, leaving second undefined
      renderModal({
        credentialType: credTypeWithDefault,
        watchedSubFormFields: ['https://example.com'], // Only 1 element for 2 fields
      } as Partial<typeof defaultProps & CredentialsExternalTestModalProps>);

      await user.type(screen.getByTestId('object-query'), 'test');
      await user.click(screen.getByRole('button', { name: 'Run' }));

      await waitFor(() => expect(capturedPayload).toBeDefined());

      // Should use default value for undefined field
      expect(capturedPayload!.inputs).toBeDefined();
      expect(capturedPayload!.inputs.url).toBe('https://example.com');
      expect(capturedPayload!.inputs.verify).toBe(true); // Used default value
      expect(capturedPayload!.metadata['object-query']).toBe('test');
    });

    it('should use empty string when watched field and default are both undefined', async () => {
      const user = userEvent.setup();
      let capturedPayload: {
        inputs: Record<string, unknown>;
        metadata: Record<string, string>;
      } | null = null;

      server.use(
        http.post(
          ({ request }: { request: Request }) =>
            request.url.includes('/credential_types/') && request.url.includes('/test/'),
          async ({ request }: { request: Request }) => {
            capturedPayload = (await request.json()) as {
              inputs: Record<string, unknown>;
              metadata: Record<string, string>;
            };
            return HttpResponse.json({}, { status: 200 });
          }
        )
      );

      const credTypeWithoutDefault = {
        ...centrifyCredentialType,
        inputs: {
          fields: [
            { id: 'url', type: 'string', label: 'URL', secret: false, help_text: '' },
            {
              id: 'optional_field',
              type: 'string',
              label: 'Optional Field',
              secret: false,
              help_text: '',
              // No default property
            },
          ],
          metadata: [
            { id: 'object-query', type: 'string', label: 'Query', secret: false, help_text: '' },
          ],
          required: ['url', 'object-query'],
        },
      };

      // Only provide value for first field, leaving second undefined
      renderModal({
        credentialType: credTypeWithoutDefault,
        watchedSubFormFields: ['https://example.com'], // Only 1 element for 2 fields
      } as Partial<typeof defaultProps & CredentialsExternalTestModalProps>);

      await user.type(screen.getByTestId('object-query'), 'test');
      await user.click(screen.getByRole('button', { name: 'Run' }));

      await waitFor(() => expect(capturedPayload).toBeDefined());

      // Should use empty string for undefined field with no default
      expect(capturedPayload!.inputs).toBeDefined();
      expect(capturedPayload!.inputs.url).toBe('https://example.com');
      expect(capturedPayload!.inputs.optional_field).toBe(''); // Used empty string fallback
      expect(capturedPayload!.metadata['object-query']).toBe('test');
    });
  });
});
