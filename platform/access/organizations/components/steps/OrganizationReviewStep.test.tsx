import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { OrganizationReviewStep } from './OrganizationReviewStep';

const mockWizardData = {
  organization: {
    name: 'Test Organization',
    description: 'Test Description',
  },
  instanceGroups: [
    { id: 1, name: 'Instance Group 1' },
    { id: 2, name: 'Instance Group 2' },
  ],
  galaxyCredentials: [
    { id: 10, name: 'Galaxy Cred 1', credential_type: 1 },
    { id: 20, name: 'Galaxy Cred 2', credential_type: 1 },
  ],
  maxHosts: 100,
  executionEnvironment: 5,
  policy: 'test/policy',
};

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: mockWizardData,
  }),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: () => ({
    data: {
      id: 5,
      name: 'Test Execution Environment',
      image: 'quay.io/test/ee:latest',
    },
  }),
}));

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfig: () => ({
    license_info: {
      license_type: 'enterprise',
    },
  }),
}));

describe('OrganizationReviewStep', () => {
  it('should render review heading', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('should display organization name', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should display organization description', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should display instance groups', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Instance Group 1')).toBeInTheDocument();
    expect(screen.getByText('Instance Group 2')).toBeInTheDocument();
  });

  it('should display galaxy credentials', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Galaxy Cred 1')).toBeInTheDocument();
    expect(screen.getByText('Galaxy Cred 2')).toBeInTheDocument();
  });

  it('should display max hosts for enterprise license', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should display policy enforcement', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('test/policy')).toBeInTheDocument();
  });

  it('should show propagation alert for new organizations', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/New organizations can take up to 15 minutes to propagate/i)
    ).toBeInTheDocument();
  });

  it('should not show propagation alert for existing organizations', () => {
    const controllerOrg = {
      id: 100,
      name: 'Test Org',
      max_hosts: 100,
    } as ControllerOrganization;

    render(
      <MemoryRouter>
        <OrganizationReviewStep controllerOrganization={controllerOrg} />
      </MemoryRouter>
    );

    expect(
      screen.queryByText(/New organizations can take up to 15 minutes to propagate/i)
    ).not.toBeInTheDocument();
  });

  it('should display execution environment when available', () => {
    render(
      <MemoryRouter>
        <OrganizationReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Execution Environment')).toBeInTheDocument();
  });
});
