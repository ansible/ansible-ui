/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { edaAPI } from '../../common/eda-utils';
import {
  CredentialFormBooleanInput,
  CredentialFormInput,
  CredentialFormInputs,
  CredentialFormStringInput,
  isFieldRequired,
} from './CredentialFormTypes';

const mockOpenCredentialPluginsModal = vi.fn();

vi.mock('./hooks/useCredentialSecretModal', () => ({
  useCredentialPluginsModal: () => mockOpenCredentialPluginsModal,
}));

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { inputs: {} } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('isFieldRequired', () => {
  it('should return true when field is in the required array', () => {
    expect(isFieldRequired(['username', 'password'], 'username')).toBe(true);
  });

  it('should return false when field is not in the required array', () => {
    expect(isFieldRequired(['username'], 'password')).toBe(false);
  });

  it('should return false when required is undefined', () => {
    expect(isFieldRequired(undefined, 'username')).toBe(false);
  });

  it('should return false for empty required array', () => {
    expect(isFieldRequired([], 'username')).toBe(false);
  });
});

describe('CredentialFormBooleanInput', () => {
  it('should render a checkbox for boolean field', () => {
    render(
      <FormWrapper>
        <CredentialFormBooleanInput
          field={{
            id: 'verify_ssl',
            label: 'Verify SSL',
            type: 'boolean',
            secret: false,
          }}
          required={[]}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Verify SSL')).toBeInTheDocument();
  });

  it('should return null when field is undefined', () => {
    const { container } = render(
      <FormWrapper>
        <CredentialFormBooleanInput field={undefined} required={[]} />
      </FormWrapper>
    );

    expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
  });
});

describe('CredentialFormInputs', () => {
  it('should render fields from credential type', () => {
    const credentialType = {
      id: 1,
      name: 'Test Type',
      inputs: {
        fields: [
          {
            id: 'username',
            label: 'Username',
            type: 'string',
            secret: false,
            multiline: false,
            choices: [],
          },
          { id: 'verify', label: 'Verify', type: 'boolean', secret: false },
        ],
        required: ['username'],
      },
      injectors: {},
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
      managed: false,
    } as EdaCredentialType;

    render(
      <FormWrapper>
        <CredentialFormInputs credentialType={credentialType} />
      </FormWrapper>
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });

  it('should not render hidden fields', () => {
    const credentialType = {
      id: 1,
      name: 'Test Type',
      inputs: {
        fields: [
          {
            id: 'token',
            label: 'Token',
            type: 'string',
            secret: true,
            multiline: false,
            choices: [],
            hidden: true,
          },
          {
            id: 'host',
            label: 'Host',
            type: 'string',
            secret: false,
            multiline: false,
            choices: [],
          },
        ],
        required: [],
      },
      injectors: {},
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
      managed: false,
    } as unknown as EdaCredentialType;

    render(
      <FormWrapper>
        <CredentialFormInputs credentialType={credentialType} />
      </FormWrapper>
    );

    expect(screen.queryByText('Token')).not.toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
  });

  it('should handle undefined credential type', () => {
    const { container } = render(
      <FormWrapper>
        <CredentialFormInputs credentialType={undefined} />
      </FormWrapper>
    );

    expect(container.innerHTML).toBe('');
  });
});

describe('CredentialFormInput', () => {
  it('should render string input for string fields', () => {
    render(
      <FormWrapper>
        <CredentialFormInput
          field={{
            id: 'host',
            label: 'Host',
            type: 'string',
            secret: false,
            multiline: false,
            choices: [],
          }}
          kind="cloud"
          required={[]}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Host')).toBeInTheDocument();
  });

  it('should render boolean input for boolean fields', () => {
    render(
      <FormWrapper>
        <CredentialFormInput
          field={{
            id: 'verify',
            label: 'Verify SSL',
            type: 'boolean',
            secret: false,
          }}
          kind="cloud"
          required={[]}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Verify SSL')).toBeInTheDocument();
  });

  it('should return null when field is undefined', () => {
    const { container } = render(
      <FormWrapper>
        <CredentialFormInput field={undefined} kind="cloud" required={[]} />
      </FormWrapper>
    );

    expect(container.innerHTML).not.toContain('input');
  });
});

describe('CredentialFormStringInput', () => {
  const server = setupServer(
    http.get(edaAPI`/eda-credentials/12/`, () =>
      HttpResponse.json({
        id: 12,
        name: 'Vault Credential',
        credential_type: { namespace: 'vault' },
      })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders select input when string field defines choices', () => {
    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={[]}
          field={{
            id: 'auth_type',
            label: 'Auth type',
            type: 'string',
            secret: false,
            multiline: false,
            choices: ['token', 'basic'],
          }}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Auth type')).toBeInTheDocument();
  });

  it('opens the credential plugins modal from the secret management button', async () => {
    const user = userEvent.setup();
    const setCredentialPluginValues = vi.fn();

    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={[]}
          setCredentialPluginValues={setCredentialPluginValues}
          field={{
            id: 'password',
            label: 'Password',
            type: 'string',
            secret: true,
            multiline: false,
            choices: [],
          }}
        />
      </FormWrapper>
    );

    await user.click(screen.getByTestId('secret-management-input'));
    expect(mockOpenCredentialPluginsModal).toHaveBeenCalledWith(
      expect.objectContaining({ setCredentialPluginValues })
    );
  });

  it('shows managed-by placeholder when accumulated plugin values reference a source credential', async () => {
    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={[]}
          accumulatedPluginValues={[
            {
              id: 1,
              input_field_name: 'password',
              source_credential: 12,
              metadata: {},
            },
          ]}
          field={{
            id: 'password',
            label: 'Password',
            type: 'string',
            secret: true,
            multiline: false,
            choices: [],
          }}
        />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Value is managed by vault: Vault Credential/i)
      ).toBeInTheDocument();
    });
  });

  it('renders multiline upload with binary format helper', () => {
    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={[]}
          field={{
            id: 'certificate',
            label: 'Certificate',
            type: 'string',
            secret: false,
            multiline: true,
            format: 'binary_base64',
            choices: [],
          }}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Certificate')).toBeInTheDocument();
  });

  it('renders a file upload for multiline text and clears a managed value', async () => {
    const user = userEvent.setup();
    const removeCredentialPluginValue = vi.fn();
    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={['certificate']}
          removeCredentialPluginValue={removeCredentialPluginValue}
          accumulatedPluginValues={[
            { id: 2, input_field_name: 'certificate', source_credential: 12, metadata: {} },
          ]}
          field={{
            id: 'certificate',
            label: 'Certificate file',
            type: 'string',
            secret: false,
            multiline: true,
            choices: [],
          }}
        />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/external secret management system/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(removeCredentialPluginValue).toHaveBeenCalledWith('certificate');
  });

  it('hides secret management for external kinds and uses the external namespace fallback', async () => {
    server.use(
      http.get(edaAPI`/eda-credentials/12/`, () =>
        HttpResponse.json({ id: 12, name: 'Vault Credential', credential_type: {} })
      )
    );
    const removeCredentialPluginValue = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="external"
          required={['password']}
          field={{
            id: 'password',
            label: 'External password',
            type: 'string',
            secret: true,
            multiline: false,
            choices: [],
          }}
        />
      </FormWrapper>
    );
    expect(screen.queryByTestId('secret-management-input')).not.toBeInTheDocument();

    rerender(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={['password']}
          removeCredentialPluginValue={removeCredentialPluginValue}
          accumulatedPluginValues={[
            { id: 1, input_field_name: 'password', source_credential: 12, metadata: {} },
          ]}
          field={{
            id: 'password',
            label: 'Managed password',
            type: 'string',
            secret: false,
            multiline: false,
            choices: [],
          }}
        />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Value is managed by external: Vault Credential/i)
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId('clear-secret-management-input'));
    expect(removeCredentialPluginValue).toHaveBeenCalledWith('password');
  });

  it('does not open the plugin modal without a setter and ignores non-string fields', async () => {
    mockOpenCredentialPluginsModal.mockClear();
    const user = userEvent.setup();
    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={[]}
          field={{
            id: 'password',
            label: 'Plain password',
            type: 'string',
            secret: true,
            multiline: false,
            choices: [],
          }}
        />
      </FormWrapper>
    );
    await user.click(screen.getByTestId('secret-management-input'));
    expect(mockOpenCredentialPluginsModal).not.toHaveBeenCalled();

    render(
      <FormWrapper>
        <CredentialFormStringInput
          kind="cloud"
          required={[]}
          field={{ id: 'flag', label: 'Flag', type: 'boolean', secret: false }}
        />
      </FormWrapper>
    );
    expect(screen.queryByText('Flag')).not.toBeInTheDocument();
  });
});
