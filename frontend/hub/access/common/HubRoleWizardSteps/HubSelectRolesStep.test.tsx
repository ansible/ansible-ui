/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { HubSelectRolesStep } from './HubSelectRolesStep';

const wizardState = vi.hoisted(() => ({
  resourceType: 'galaxy.namespace' as string | undefined,
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: wizardState.resourceType },
    stepData: {},
    activeStep: { id: 'roles' },
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

const role = (name: string, description: string) => ({
  id: name,
  name,
  description,
  managed: true,
  permissions: [],
  url: `/roles/${name}/`,
  content_type: null,
  created: '',
  modified: '',
  created_by: null,
  modified_by: null,
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
});

const server = setupServer(
  http.get('*/_ui/v2/role_definitions/', () =>
    HttpResponse.json({
      count: 2,
      next: null,
      previous: null,
      results: [
        role('galaxy.collection_publisher', 'fallback publisher'),
        role('custom.role', 'Custom role description'),
      ],
    })
  ),
  http.options('*/_ui/v2/role_definitions/', () =>
    HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { hubRoles: [] } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('HubSelectRolesStep', () => {
  beforeEach(() => {
    wizardState.resourceType = 'galaxy.namespace';
  });

  it('renders role selection for namespaces and managed role descriptions', async () => {
    render(
      <FormWrapper>
        <HubSelectRolesStep fieldNameForPreviousStep="resources" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Select roles to apply to all of your selected namespaces.')
      ).toBeInTheDocument();
    });
    expect(await screen.findByText('Upload and modify collections.')).toBeInTheDocument();
    expect(screen.getByText('Custom role description')).toBeInTheDocument();
  });

  it.each([
    ['galaxy.ansiblerepository', 'Select roles to apply to all of your selected repositories.'],
    ['galaxy.collectionremote', 'Select roles to apply to all of your selected remotes.'],
    [
      'galaxy.containernamespace',
      'Select roles to apply to all of your selected execution environments.',
    ],
    ['galaxy.other', 'Select roles to apply to all of your selected resources.'],
  ])('describes %s resources', async (resourceType, description) => {
    wizardState.resourceType = resourceType;
    render(
      <FormWrapper>
        <HubSelectRolesStep />
      </FormWrapper>
    );

    expect(await screen.findByText(description)).toBeInTheDocument();
  });

  it('uses an explicit description and a system content type', async () => {
    wizardState.resourceType = 'galaxy.namespace';
    render(
      <FormWrapper>
        <HubSelectRolesStep
          contentType="system"
          descriptionForRoleSelection="Apply these roles."
          title="Roles"
        />
      </FormWrapper>
    );

    expect(await screen.findByRole('heading', { name: 'Roles' })).toBeInTheDocument();
    expect(screen.getByText('Apply these roles.')).toBeInTheDocument();
    expect(
      screen.queryByText('Select roles to apply to all of your selected namespaces.')
    ).not.toBeInTheDocument();
  });

  it('hides the description when the resource type is system', async () => {
    wizardState.resourceType = 'system';
    render(
      <FormWrapper>
        <HubSelectRolesStep />
      </FormWrapper>
    );

    expect(await screen.findByText('Upload and modify collections.')).toBeInTheDocument();
    expect(
      screen.queryByText('Select roles to apply to all of your selected resources.')
    ).not.toBeInTheDocument();
  });

  it('falls back when the wizard has no resource type', async () => {
    wizardState.resourceType = undefined;
    render(
      <FormWrapper>
        <HubSelectRolesStep contentType="galaxy.namespace" />
      </FormWrapper>
    );

    expect(
      await screen.findByText('Select roles to apply to all of your selected resources.')
    ).toBeInTheDocument();
  });
});
