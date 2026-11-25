/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { userEvent } from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaSelectResourceTypeStep } from './EdaSelectResourceTypeStep';

const wizard = vi.hoisted(() => ({
  resourceType: '' as string,
  setWizardData: vi.fn(),
  setStepData: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: wizard.resourceType },
    stepData: {},
    activeStep: null,
    setWizardData: wizard.setWizardData,
    setStepData: wizard.setStepData,
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
  http.options(edaAPI`/role_definitions/`, () => HttpResponse.json(mockOptions))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({
  children,
  resourceType = '',
}: {
  children: React.ReactNode;
  resourceType?: string;
}) {
  const methods = useForm({ defaultValues: { resourceType } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('EdaSelectResourceTypeStep', () => {
  beforeEach(() => {
    wizard.resourceType = '';
    wizard.setWizardData.mockClear();
    wizard.setStepData.mockClear();
  });

  it('shows a loading page while resource types are requested', () => {
    server.use(
      http.options(edaAPI`/role_definitions/`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(mockOptions);
      })
    );

    render(
      <FormWrapper>
        <EdaSelectResourceTypeStep />
      </FormWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

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

  it('filters unsupported types and resets wizard data when the selection changes', async () => {
    const user = userEvent.setup();
    render(
      <FormWrapper>
        <EdaSelectResourceTypeStep />
      </FormWrapper>
    );

    await user.click(await screen.findByRole('button', { name: 'Select a resource type' }));
    expect(screen.getByRole('option', { name: 'Project' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Extra Var' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Team' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Rulebook' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Project' }));
    expect(wizard.setWizardData).toHaveBeenCalledWith({});
    expect(wizard.setStepData).toHaveBeenCalledWith({});
  });

  it('does not reset wizard data when the same resource type is selected', async () => {
    wizard.resourceType = 'eda.project';
    const user = userEvent.setup();
    render(
      <FormWrapper resourceType="eda.project">
        <EdaSelectResourceTypeStep />
      </FormWrapper>
    );

    await user.click(await screen.findByRole('button', { name: 'Project' }));
    await user.click(await screen.findByRole('option', { name: 'Project' }));
    expect(wizard.setWizardData).not.toHaveBeenCalled();
    expect(wizard.setStepData).not.toHaveBeenCalled();
  });

  it('renders an empty select when content type choices are missing', async () => {
    server.use(
      http.options(edaAPI`/role_definitions/`, () => HttpResponse.json({ actions: { GET: {} } }))
    );

    render(
      <FormWrapper>
        <EdaSelectResourceTypeStep />
      </FormWrapper>
    );

    expect(await screen.findByText('Select a resource type')).toBeInTheDocument();
  });
});
