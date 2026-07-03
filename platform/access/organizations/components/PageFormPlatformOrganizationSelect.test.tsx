/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageFormPlatformOrganizationSelect } from './PageFormPlatformOrganizationSelect';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const FormWrapper = () => {
    const form = useForm({
      defaultValues: {
        organization: null,
      },
    });

    return (
      <MemoryRouter>
        <FormProvider {...form}>{children}</FormProvider>
      </MemoryRouter>
    );
  };

  return <FormWrapper />;
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
