import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { SetupServer } from 'msw/node';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { Survey } from '../interfaces/Survey';
import { SurveyStep } from './SurveyStep';
import { awxAPI } from './api/awx-utils';

const testSurveys = {
  withColons: {
    name: 'Survey with Colons',
    description: '',
    spec: [
      {
        question_name: 'Environment Selection',
        question_description: 'Select the environment',
        required: true,
        type: 'multiplechoice',
        variable: 'environment',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: [
          'production: Main production environment',
          'staging: Testing environment',
          'development: Local development',
        ],
      },
      {
        question_name: 'Database Type',
        question_description: 'Select database type',
        required: false,
        type: 'multiselect',
        variable: 'database',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: 'mysql: MySQL Database\npostgres: PostgreSQL Database',
      },
    ],
  },
  withoutColons: {
    name: 'Simple Survey',
    description: '',
    spec: [
      {
        question_name: 'Simple Choice',
        question_description: 'Simple selection',
        required: true,
        type: 'multiplechoice',
        variable: 'simple',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: ['option1', 'option2', 'option3'],
      },
    ],
  },
  empty: {
    name: 'Empty Survey',
    description: '',
    spec: [],
  },
};

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const form = useForm();
  return <FormProvider {...form}>{children}</FormProvider>;
}

function renderSurveyStep(server: SetupServer, templateId: string, survey: Survey) {
  const apiPath = awxAPI`/job_templates/${templateId}/survey_spec/`;

  server.use(http.get(apiPath, () => HttpResponse.json(survey)));

  vi.mocked(usePageWizard).mockReturnValue({
    wizardData: {
      resource: {
        id: parseInt(templateId),
        type: 'job_template',
        name: 'Test Template',
        description: '',
      },
    },
    stepData: { survey: {} },
  } as unknown as ReturnType<typeof usePageWizard>);

  render(
    <TestWrapper>
      <SurveyStep templateId={templateId} />
    </TestWrapper>
  );
}

describe('SurveyStep', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('renders survey with questions containing colons in choices', async () => {
    const user = userEvent.setup();
    renderSurveyStep(server, '123', testSurveys.withColons);

    await waitFor(() => {
      expect(screen.getByText('Environment Selection')).toBeInTheDocument();
      expect(screen.getByText('Database Type')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /select option/i }));

    await waitFor(() => {
      expect(screen.getByText('production: Main production environment')).toBeInTheDocument();
      expect(screen.getByText('staging: Testing environment')).toBeInTheDocument();
      expect(screen.getByText('development: Local development')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Database Type' }));

    await waitFor(() => {
      expect(screen.getByText('mysql: MySQL Database')).toBeInTheDocument();
      expect(screen.getByText('postgres: PostgreSQL Database')).toBeInTheDocument();
    });
  });

  test('renders survey with simple choices (no colons)', async () => {
    const user = userEvent.setup();
    renderSurveyStep(server, '789', testSurveys.withoutColons);

    await waitFor(() => {
      expect(screen.getByText('Simple Choice')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /select option/i }));

    await waitFor(() => {
      expect(screen.getByText('option1')).toBeInTheDocument();
      expect(screen.getByText('option2')).toBeInTheDocument();
      expect(screen.getByText('option3')).toBeInTheDocument();
    });
  });

  test('handles empty survey gracefully', async () => {
    renderSurveyStep(server, '000', testSurveys.empty);

    await waitFor(() => {
      expect(document.querySelector('.pf-v6-c-form')).toBeInTheDocument();
    });
  });
});
