/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaSelectResourceTypeStep } from './EdaSelectResourceTypeStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: '' },
    stepData: {},
    activeStep: null,
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

const mockOptions = {
  actions: {
    GET: {
      content_type: {
        choices: [
          { value: 'eda.project', display_name: 'Project' },
          { value: 'eda.activation', display_name: 'Activation' },
          { value: 'eda.edacredential', display_name: 'Credential' },
          { value: 'eda.decisionenvironment', display_name: 'Decision Environment' },
          { value: 'eda.eventstream', display_name: 'Event Stream' },
          { value: 'eda.credentialtype', display_name: 'Credential Type' },
          { value: 'eda.extravar', display_name: 'Extra Var' },
          { value: 'eda.auditrule', display_name: 'Audit Rule' },
          { value: 'eda.rulebookprocess', display_name: 'Rulebook Process' },
          { value: 'eda.rulebook', display_name: 'Rulebook' },
          { value: 'shared.team', display_name: 'Team' },
        ],
      },
    },
  },
};

const server = setupServer(
  http.options('*/role_definitions/', () => HttpResponse.json(mockOptions))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { resourceType: '' } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('EdaSelectResourceTypeStep', () => {
  it('should render resource type label', async () => {
    render(
      <FormWrapper>
        <EdaSelectResourceTypeStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Resource type')).toBeInTheDocument();
    });
  });

  it('should render placeholder text', async () => {
    render(
      <FormWrapper>
        <EdaSelectResourceTypeStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select a resource type')).toBeInTheDocument();
    });
  });
});
