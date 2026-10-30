/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RemoteFormProps } from '../RemoteForm';
import { CertificatesAdvancedRemoteInputs } from './CertificatesAdvancedRemoteInputs';
import { MiscAdvancedRemoteInputs } from './MiscAdvancedRemoteInputs';
import { ProxyAdvancedRemoteInputs } from './ProxyAdvancedRemoteInputs';

function FormWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<RemoteFormProps>;
}) {
  const methods = useForm<RemoteFormProps>({
    defaultValues: {
      name: '',
      url: '',
      signed_only: false,
      tls_validation: true,
      ...defaultValues,
    },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('MiscAdvancedRemoteInputs', () => {
  it('renders download concurrency and rate limit fields', () => {
    render(
      <FormWrapper>
        <MiscAdvancedRemoteInputs />
      </FormWrapper>
    );

    expect(screen.getByText('Download concurrency')).toBeInTheDocument();
    expect(screen.getByText('Rate limit')).toBeInTheDocument();
  });
});

describe('ProxyAdvancedRemoteInputs', () => {
  it('renders proxy URL and credential fields', () => {
    render(
      <FormWrapper>
        <ProxyAdvancedRemoteInputs handleOnClear={vi.fn()} shouldHideField={() => false} />
      </FormWrapper>
    );

    expect(screen.getByText('Proxy URL')).toBeInTheDocument();
    expect(screen.getByText('Proxy username')).toBeInTheDocument();
    expect(screen.getByText('Proxy password')).toBeInTheDocument();
  });

  it('invokes handleOnClear for proxy credentials', async () => {
    const handleOnClear = vi.fn();
    const user = userEvent.setup();
    render(
      <FormWrapper
        defaultValues={{
          hidden_fields: [{ name: 'proxy_username', is_set: true }],
        }}
      >
        <ProxyAdvancedRemoteInputs
          handleOnClear={handleOnClear}
          shouldHideField={(name) => name === 'proxy_username'}
        />
      </FormWrapper>
    );

    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(handleOnClear).toHaveBeenCalledWith('proxy_username');
  });
});

describe('CertificatesAdvancedRemoteInputs', () => {
  it('renders TLS and certificate upload fields', () => {
    render(
      <FormWrapper>
        <CertificatesAdvancedRemoteInputs handleOnClear={vi.fn()} shouldHideField={() => false} />
      </FormWrapper>
    );

    expect(screen.getByText('TLS validation')).toBeInTheDocument();
    expect(screen.getByText('Client key')).toBeInTheDocument();
    expect(screen.getByText('Client certificate')).toBeInTheDocument();
    expect(screen.getByText('CA certificate')).toBeInTheDocument();
  });
});
