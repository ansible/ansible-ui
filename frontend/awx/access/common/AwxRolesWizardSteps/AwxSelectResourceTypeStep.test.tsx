import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxSelectResourceTypeStep } from './AwxSelectResourceTypeStep';

const wizardState = vi.hoisted(() => ({
  wizardData: { resourceType: 'awx.project' } as Record<string, unknown>,
  stepData: {} as Record<string, unknown>,
  setWizardData: vi.fn(),
  setStepData: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: wizardState.wizardData,
    stepData: wizardState.stepData,
    setWizardData: wizardState.setWizardData,
    setStepData: wizardState.setStepData,
  }),
}));

const server = setupServer(
  http.options(awxAPI`/role_definitions/`, () =>
    HttpResponse.json({
      actions: {
        GET: {
          content_type: {
            choices: [
              ['awx.project', 'Project'],
              ['eda.project', 'EDA Project'],
              ['awx.credential', 'Credential'],
            ],
          },
        },
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  wizardState.setWizardData.mockClear();
  wizardState.setStepData.mockClear();
});
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { resourceType: 'awx.project' } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('AwxSelectResourceTypeStep', () => {
  it('shows loading page while options are loading', () => {
    server.use(http.options(awxAPI`/role_definitions/`, () => new Promise(() => {})));
    render(
      <FormWrapper>
        <AwxSelectResourceTypeStep />
      </FormWrapper>
    );
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('renders resource type field when options are loaded', async () => {
    render(
      <FormWrapper>
        <AwxSelectResourceTypeStep />
      </FormWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('Resource type')).toBeInTheDocument();
    });
  });
});
