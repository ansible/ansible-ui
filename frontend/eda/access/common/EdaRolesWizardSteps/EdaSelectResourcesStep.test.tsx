/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaSelectResourcesStep } from './EdaSelectResourcesStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: { resourceType: 'eda.project' },
    stepData: {},
    activeStep: null,
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

const mockProjects = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    { id: 1, name: 'Project Alpha' },
    { id: 2, name: 'Project Beta' },
  ],
};

const server = setupServer(http.get(edaAPI`/projects/`, () => HttpResponse.json(mockProjects)));

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

describe('EdaSelectResourcesStep', () => {
  it('should render the title for selected resource type', async () => {
    render(
      <FormWrapper>
        <EdaSelectResourcesStep userOrTeamName="TestUser" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select projects')).toBeInTheDocument();
    });
  });

  it('should render description with user name', async () => {
    render(
      <FormWrapper>
        <EdaSelectResourcesStep userOrTeamName="TestUser" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Choose the resources that you want TestUser to have certain access to/)
      ).toBeInTheDocument();
    });
  });

  it('should render the list view with project data', async () => {
    render(
      <FormWrapper>
        <EdaSelectResourcesStep userOrTeamName="Admin" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });
});
