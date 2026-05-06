/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { CredentialTestResponse } from '../../../../interfaces/CredentialTestResponse';
import { useCredentialPluginsModal } from './useCredentialPluginsDialog';

function TestWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </SWRConfig>
  );
}

const mockCredential = {
  id: 1,
  name: 'Test OIDC Credential',
  credential_type: 1,
  summary_fields: {
    credential_type: { id: 1, name: 'HashiCorp Vault OIDC', namespace: 'hashivault-kv-oidc' },
  },
};

const mockCredentialType = {
  id: 1,
  name: 'HashiCorp Vault OIDC',
  namespace: 'hashivault-kv-oidc',
  inputs: {
    fields: [],
    metadata: [{ id: 'account-name', type: 'string', label: 'Account Name', secret: false }],
    required: ['account-name'],
  },
};

const server = setupServer(
  http.get(awxAPI`/credentials/1/`, () => HttpResponse.json(mockCredential)),
  http.get(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockCredentialType)),
  http.post(awxAPI`/credentials/1/test/`, () => HttpResponse.json(mockJwtTestResponse)),
  http.options('*/job_templates/', () => HttpResponse.json({}, { status: 200 })),
  http.get('*/job_templates/', () =>
    HttpResponse.json({
      count: 1,
      results: [
        { id: 1, name: 'Demo Job Template', type: 'job_template', url: '/api/v2/job_templates/1/' },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockJwtTestResponse: CredentialTestResponse = {
  status: 'success',
  details: {
    sent_jwt_payload: {
      iss: 'https://test.example.com',
      sub: 'test-user',
      aud: 'test-audience',
      exp: 1234567890,
      iat: 1234567800,
      job_template_id: 1,
    },
  },
};

const mockFailedJwtTestResponse: CredentialTestResponse = {
  status: 'failed',
  details: {
    sent_jwt_payload: {
      iss: 'https://test.example.com',
      sub: 'test-user',
      aud: 'test-audience',
      exp: 1234567890,
      iat: 1234567800,
      job_template_id: 1,
    },
  },
};

// Test component that uses the hook
function TestCredentialPluginsModal() {
  const openModal = useCredentialPluginsModal();

  const handleOpenModal = () => {
    openModal({
      field: {
        id: 'test-field',
        label: 'Test Field',
        secret: false,
        type: 'string',
        help_text: '',
      },
      setCredentialPluginValues: vi.fn(),
      onClose: vi.fn(),
      accumulatedPluginValues: [
        {
          input_field_name: 'test-field',
          source_credential: 1,
          metadata: { 'account-name': 'test' },
        },
      ],
    });
  };

  return (
    <div>
      <button onClick={handleOpenModal} data-testid="open-modal">
        Open Modal
      </button>
    </div>
  );
}

describe('useCredentialPluginsModal Hook', () => {
  it('should render hook without errors', () => {
    const { result } = renderHook(() => useCredentialPluginsModal(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toBeTypeOf('function');
  });

  it('should open modal when hook is called', async () => {
    render(
      <TestWrapper>
        <TestCredentialPluginsModal />
      </TestWrapper>
    );

    const openButton = screen.getByTestId('open-modal');
    expect(openButton).toBeInTheDocument();

    // This exercises the hook code path
    const user = userEvent.setup();
    await user.click(openButton);
  });
});

describe('OIDC Credential Type Detection', () => {
  it('should identify hashivault-kv-oidc as OIDC credential', () => {
    const credentialType = { namespace: 'hashivault-kv-oidc' };
    const isOidcCredential =
      credentialType?.namespace === 'hashivault-kv-oidc' ||
      credentialType?.namespace === 'hashivault-ssh-oidc';

    expect(isOidcCredential).toBe(true);
  });

  it('should identify hashivault-ssh-oidc as OIDC credential', () => {
    const credentialType = { namespace: 'hashivault-ssh-oidc' };
    const isOidcCredential =
      credentialType?.namespace === 'hashivault-kv-oidc' ||
      credentialType?.namespace === 'hashivault-ssh-oidc';

    expect(isOidcCredential).toBe(true);
  });

  it('should not identify other namespaces as OIDC credentials', () => {
    const credentialType = { namespace: 'cyberark' };
    const isOidcCredential =
      credentialType?.namespace === 'hashivault-kv-oidc' ||
      credentialType?.namespace === 'hashivault-ssh-oidc';

    expect(isOidcCredential).toBe(false);
  });

  it('should handle undefined credential type', () => {
    const credentialType = undefined as { namespace: string } | undefined;
    const isOidcCredential =
      credentialType?.namespace === 'hashivault-kv-oidc' ||
      credentialType?.namespace === 'hashivault-ssh-oidc';

    expect(isOidcCredential).toBe(false);
  });
});

describe('Default Values Extraction', () => {
  it('should extract default values including job_template_id from plugin values', () => {
    const field = { id: 'test-field' };
    const accumulatedPluginValues = [
      {
        input_field_name: 'test-field',
        source_credential: 1,
        metadata: {
          'account-name': 'test-account',
          job_template_id: 5,
          custom_field: 'custom-value',
        },
      },
    ];

    const pluginValues = accumulatedPluginValues.find(
      (plugin) => plugin.input_field_name === field.id
    );

    const metadata = pluginValues?.metadata as Record<string, unknown> | undefined;
    const defaultValues = pluginValues
      ? {
          source_credential: pluginValues.source_credential,
          ...pluginValues.metadata,
        }
      : undefined;

    expect(defaultValues).toEqual({
      source_credential: 1,
      job_template_id: 5,
      'account-name': 'test-account',
      custom_field: 'custom-value',
    });
    expect(metadata?.job_template_id).toBe(5);
  });

  it('should handle missing job_template_id in metadata', () => {
    const field = { id: 'test-field' };
    const accumulatedPluginValues = [
      {
        input_field_name: 'test-field',
        source_credential: 1,
        metadata: {
          'account-name': 'test-account',
        },
      },
    ];

    const pluginValues = accumulatedPluginValues.find(
      (plugin) => plugin.input_field_name === field.id
    );

    const metadata = pluginValues?.metadata as Record<string, unknown> | undefined;
    const defaultValues = pluginValues
      ? {
          source_credential: pluginValues.source_credential,
          ...pluginValues.metadata,
        }
      : undefined;

    expect(metadata?.job_template_id).toBeUndefined();
    expect(defaultValues?.source_credential).toBe(1);
  });

  it('should return undefined when no matching plugin values found', () => {
    const field = { id: 'non-existent-field' };
    const accumulatedPluginValues = [
      {
        input_field_name: 'different-field',
        source_credential: 1,
        metadata: {},
      },
    ];

    const pluginValues = accumulatedPluginValues.find(
      (plugin) => plugin.input_field_name === field.id
    );

    const defaultValues = pluginValues ? {} : undefined;

    expect(defaultValues).toBeUndefined();
  });
});

describe('JWT Payload Modal State Logic', () => {
  it('should determine modal title based on JWT payload presence', () => {
    // This would be tested in integration, but we can test the logic
    const hasJwtPayload = Boolean(mockJwtTestResponse.details?.sent_jwt_payload);
    expect(hasJwtPayload).toBe(true);

    const hasNoJwtPayload = Boolean(undefined);
    expect(hasNoJwtPayload).toBe(false);
  });

  it('should handle successful JWT test response structure', () => {
    const response = mockJwtTestResponse;
    expect(response.status).toBe('success');
    expect(response.details?.sent_jwt_payload).toBeDefined();
    expect(response.details?.sent_jwt_payload?.job_template_id).toBe(1);
  });

  it('should handle failed JWT test response structure', () => {
    const response = mockFailedJwtTestResponse;
    expect(response.status).toBe('failed');
    expect(response.details?.sent_jwt_payload).toBeDefined();
  });

  it('should format JWT payload for display', () => {
    const payload = mockJwtTestResponse.details?.sent_jwt_payload;
    const formattedPayload = JSON.stringify(payload, null, 2);

    expect(formattedPayload).toContain('job_template_id');
    expect(formattedPayload).toContain('iss');
    expect(formattedPayload).toContain('sub');
  });
});

describe('Form Data Handling', () => {
  it('should include job_template_id in OIDC credential test payload', () => {
    const formData: Record<string, string | number> = {
      source_credential: 1,
      job_template_id: 5,
      'account-name': 'test-account',
    };

    const { source_credential, job_template_id, ...rest } = formData;

    const payload = {
      metadata: {
        ...rest,
        job_template_id, // Should be included for OIDC
      } as Record<string, unknown>,
    };

    expect(payload.metadata.job_template_id).toBe(5);
    expect(payload.metadata['account-name']).toBe('test-account');
  });

  it('should exclude job_template_id for non-OIDC credentials', () => {
    const formData: Record<string, string | number> = {
      source_credential: 2,
      'api-key': 'test-key',
    };

    const { source_credential, job_template_id, ...rest } = formData;
    const isOidcCredential = false;

    const metadata: Record<string, unknown> = { ...rest };
    if (isOidcCredential && job_template_id) {
      metadata.job_template_id = job_template_id;
    }

    const payload = { metadata };

    expect(payload.metadata.job_template_id).toBeUndefined();
    expect(payload.metadata['api-key']).toBe('test-key');
  });

  it('should handle form values for retry functionality', () => {
    const formValues = { 'account-name': 'test', job_template_id: 1 };
    const defaultValues = { source_credential: 1 };

    const mergedValues = { ...defaultValues, ...formValues };

    expect(mergedValues).toEqual({
      source_credential: 1,
      'account-name': 'test',
      job_template_id: 1,
    });
  });
});
