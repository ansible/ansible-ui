/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import {
  CredentialFormBooleanInput,
  CredentialFormInput,
  CredentialFormInputs,
  isFieldRequired,
} from './CredentialFormTypes';

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

    expect(container.children.length).toBeGreaterThanOrEqual(0);
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
