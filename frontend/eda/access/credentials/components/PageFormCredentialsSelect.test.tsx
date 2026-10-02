/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageFormCredentialSelect } from './PageFormCredentialsSelect';

interface TestFormValues {
  credentials: unknown[];
}

function TestFormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<TestFormValues>({ defaultValues: { credentials: [] } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormCredentialSelect', () => {
  it('should render the credential select component', () => {
    render(
      <MemoryRouter>
        <TestFormWrapper>
          <PageFormCredentialSelect
            name="credentials"
            labelHelp="Select credentials for this resource"
          />
        </TestFormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Credential')).toBeInTheDocument();
  });

  it('should render with isRequired prop', () => {
    render(
      <MemoryRouter>
        <TestFormWrapper>
          <PageFormCredentialSelect name="credentials" labelHelp="Select credentials" isRequired />
        </TestFormWrapper>
      </MemoryRouter>
    );

    expect(screen.getByText('Credential')).toBeInTheDocument();
  });
});
