/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen } from '@testing-library/react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageFormPlatformOrganizationSelect } from './PageFormPlatformOrganizationSelect';

interface FormWrapperProps {
  children: React.ReactNode;
  form: UseFormReturn;
}

function FormWrapper({ children, form }: FormWrapperProps) {
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const form = useForm({
    defaultValues: {
      organization: null,
    },
  });

  return <FormWrapper form={form}>{children}</FormWrapper>;
}

describe('PageFormPlatformOrganizationSelect', () => {
  it('should render the select component', () => {
    render(
      <TestWrapper>
        <PageFormPlatformOrganizationSelect name="organization" />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Organization')).toBeInTheDocument();
  });

  it('should render with default label when not specified', () => {
    render(
      <TestWrapper>
        <PageFormPlatformOrganizationSelect name="organization" />
      </TestWrapper>
    );

    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('should render the select button', () => {
    render(
      <TestWrapper>
        <PageFormPlatformOrganizationSelect name="organization" />
      </TestWrapper>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
