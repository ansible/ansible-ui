/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaSelectRolesStep } from './EdaSelectRolesStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(() => ({
    wizardData: { resourceType: 'eda.project' },
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
    stepData: {},
    allSteps: [],
    activeStep: { id: 'roles' },
  })),
}));

const server = setupServer(
  http.get('*/role_definitions/*', () =>
    HttpResponse.json({
      count: 1,
      results: [{ id: 1, name: 'Admin', description: 'Admin role', permissions: ['*'] }],
    })
  ),
  http.options('*/role_definitions*', () => HttpResponse.json({ actions: { GET: {} } }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { edaRoles: [] } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('EdaSelectRolesStep', () => {
  it('should render the select roles step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <FormWrapper>
          <EdaSelectRolesStep />
        </FormWrapper>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Select roles to apply')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
