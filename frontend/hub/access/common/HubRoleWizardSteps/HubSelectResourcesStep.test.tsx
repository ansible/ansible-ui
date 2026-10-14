/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HubSelectResourcesStep } from './HubSelectResourcesStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: 'galaxy.namespace' },
    stepData: {},
    activeStep: null,
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

const mockNamespaces = {
  meta: { count: 1 },
  links: { next: null },
  data: [
    {
      pulp_href: '/namespaces/1/',
      id: 1,
      name: 'demo',
      company: '',
      email: '',
      avatar_url: '',
      description: '',
      links: [],
      groups: [],
      related_fields: {},
      resources: '',
    },
  ],
};

const server = setupServer(
  http.get('*/_ui/v1/namespaces/*', () => HttpResponse.json(mockNamespaces))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { resources: [] } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('HubSelectResourcesStep', () => {
  it('renders namespace selection title', async () => {
    render(
      <FormWrapper>
        <HubSelectResourcesStep userOrTeamName="TestTeam" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select namespaces')).toBeInTheDocument();
    });
  });
});
