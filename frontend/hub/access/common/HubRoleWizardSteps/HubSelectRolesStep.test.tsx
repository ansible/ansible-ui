/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HubSelectRolesStep } from './HubSelectRolesStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: 'galaxy.namespace' },
    stepData: {},
    activeStep: { id: 'roles' },
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

const server = setupServer(
  http.get('*/_ui/v2/role_definitions/', () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
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
  it('renders role selection for namespaces', async () => {
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
  });
});
