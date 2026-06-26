/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaSelectTeamsStep } from './EdaSelectTeamsStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: {},
    stepData: {},
    activeStep: null,
    setWizardData: vi.fn(),
    setStepData: vi.fn(),
  }),
}));

const mockTeams = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    { id: 1, name: 'Team Alpha' },
    { id: 2, name: 'Team Beta' },
  ],
};

const server = setupServer(http.get('*/teams/', () => HttpResponse.json(mockTeams)));

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { teams: [] } });
  return (
    <FormProvider {...methods}>
      <MemoryRouter>{children}</MemoryRouter>
    </FormProvider>
  );
}

describe('EdaSelectTeamsStep', () => {
  it('should render the title', async () => {
    render(
      <FormWrapper>
        <EdaSelectTeamsStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select team(s)')).toBeInTheDocument();
    });
  });

  it('should render default description', async () => {
    render(
      <FormWrapper>
        <EdaSelectTeamsStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Select the team(s) that you want to apply new roles to.')
      ).toBeInTheDocument();
    });
  });

  it('should render custom description when provided', async () => {
    render(
      <FormWrapper>
        <EdaSelectTeamsStep descriptionForTeamsSelection="Custom team selection message" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom team selection message')).toBeInTheDocument();
    });
  });

  it('should render teams from API', async () => {
    render(
      <FormWrapper>
        <EdaSelectTeamsStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Beta')).toBeInTheDocument();
    });
  });

  it('should handle empty teams list', async () => {
    server.use(
      http.get('*/teams/', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    render(
      <FormWrapper>
        <EdaSelectTeamsStep />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select team(s)')).toBeInTheDocument();
    });
  });
});
