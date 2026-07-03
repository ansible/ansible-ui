/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { OrganizationDetailsStep } from './OrganizationDetailsStep';

vi.mock('../../../../main/GatewayServices', () => ({
  useHasAwxService: () => true,
}));

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfig: () => ({
    license_info: {
      license_type: 'enterprise',
    },
  }),
}));

interface FormWrapperProps {
  children: React.ReactNode;
  form: UseFormReturn<any>;
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
      organization: {
        name: '',
        description: '',
      },
      instanceGroups: [],
      galaxyCredentials: [],
      executionEnvironment: undefined,
      maxHosts: 0,
      policy: '',
    },
  });

  return <FormWrapper form={form}>{children}</FormWrapper>;
}

describe('OrganizationDetailsStep', () => {
  it('should render organization details heading', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    expect(screen.getByText('Organization details')).toBeInTheDocument();
  });

  it('should render name field', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('should render description field', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should disable name field when managed', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={true} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeDisabled();
  });

  it('should enable name field when not managed', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).not.toBeDisabled();
  });

  it('should render AWX-specific fields when AWX service is available', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    expect(screen.getAllByText(/execution environment/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/instance groups/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/galaxy credentials/i).length).toBeGreaterThan(0);
  });

  it('should render max hosts field for enterprise license', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/max hosts/i)).toBeInTheDocument();
  });

  it('should render policy enforcement field', () => {
    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/policy enforcement/i)).toBeInTheDocument();
  });

  it('should use controller organization when provided', () => {
    const controllerOrg = {
      id: 100,
      name: 'Test Org',
      max_hosts: 100,
    } as ControllerOrganization;

    render(
      <TestWrapper>
        <OrganizationDetailsStep managed={false} controllerOrganization={controllerOrg} />
      </TestWrapper>
    );

    expect(screen.getAllByText(/execution environment/i).length).toBeGreaterThan(0);
  });
});
