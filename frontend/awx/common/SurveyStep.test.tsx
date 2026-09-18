import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { SetupServer } from 'msw/node';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi, type Mock } from 'vitest';
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
  withColonInQuestionName: {
    name: 'Colon in question name',
    description: '',
    spec: [
      {
        question_name: 'Markets:',
        question_description: 'Select a market',
        required: true,
        type: 'text',
        variable: 'market',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: [],
      },
      {
        question_name: 'Markets: US',
        question_description: 'Select a US market',
        required: false,
        type: 'text',
        variable: 'us_market',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: [],
      },
      {
        question_name: 'Minimum: quantity',
        question_description: '',
        required: false,
        type: 'integer',
        variable: 'minimum_quantity',
        min: 0,
        max: 10,
        default: '',
        new_question: false,
        choices: [],
      },
      {
        question_name: 'Rate: percentage',
        question_description: '',
        required: false,
        type: 'float',
        variable: 'rate_percentage',
        min: 0,
        max: 100,
        default: '',
        new_question: false,
        choices: [],
      },
      {
        question_name: 'Password: token',
        question_description: '',
        required: false,
        type: 'password',
        variable: 'password_token',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: [],
      },
      {
        question_name: 'Notes: details',
        question_description: '',
        required: false,
        type: 'textarea',
        variable: 'notes_details',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: [],
      },
      {
        question_name: 'Environment: type',
        question_description: '',
        required: false,
        type: 'multiplechoice',
        variable: 'environment_type',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: ['development'],
      },
      {
        question_name: 'Markets: selected',
        question_description: '',
        required: false,
        type: 'multiselect',
        variable: 'markets_selected',
        min: 0,
        max: 0,
        default: '',
        new_question: false,
        choices: ['North America'],
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

const surveySpecOptionsWithPatterns = {
  actions: {
    POST: {
      spec: {
        type: 'json',
        question_name: {
          pattern: '^[^<]+$',
          pattern_description: 'No angle brackets in survey answer',
        },
      },
    },
  },
};

function renderSurveyStep(
  server: SetupServer,
  templateId: string,
  survey: Survey,
  options?: { surveySpecOptions?: object }
) {
  const apiPath = awxAPI`/job_templates/${templateId}/survey_spec/`;

  server.use(
    http.get(apiPath, () => HttpResponse.json(survey)),
    http.options(apiPath, () =>
      HttpResponse.json(options?.surveySpecOptions ?? { actions: { POST: {} } })
    )
  );

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

  test('renders survey question names containing colons for every field type', async () => {
    const { t } = vi.mocked(useTranslation)();
    const mockedT = t as unknown as Mock;
    const translationCallCount = mockedT.mock.calls.length;
    renderSurveyStep(server, '999', testSurveys.withColonInQuestionName);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Markets:' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Markets: US' })).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: 'Minimum: quantity' })).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: 'Rate: percentage' })).toBeInTheDocument();
      expect(screen.getByText('Password: token')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Notes: details' })).toBeInTheDocument();
      expect(screen.getByText('Environment: type')).toBeInTheDocument();
      expect(screen.getByText('Markets: selected')).toBeInTheDocument();
    });
    const newTranslationCalls = mockedT.mock.calls.slice(translationCallCount);
    expect(newTranslationCalls).not.toContainEqual(['Markets:']);
    expect(newTranslationCalls).not.toContainEqual(['Markets: US']);
  });

  test('handles empty survey gracefully', async () => {
    renderSurveyStep(server, '000', testSurveys.empty);

    await waitFor(() => {
      expect(document.querySelector('.pf-v6-c-form')).toBeInTheDocument();
    });
  });

  test('applies survey_spec OPTIONS pattern validation to text survey answers', async () => {
    const user = userEvent.setup();
    const textSurvey: Survey = {
      name: 'Text Survey',
      description: '',
      spec: [
        {
          question_name: 'Notes',
          question_description: 'Enter notes',
          required: false,
          type: 'text',
          variable: 'notes',
          min: 0,
          max: 1024,
          default: '',
          new_question: false,
          choices: '',
        },
      ],
    };

    renderSurveyStep(server, '321', textSurvey, {
      surveySpecOptions: surveySpecOptionsWithPatterns,
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Notes'), 'bad<script>');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('No angle brackets in survey answer')).toBeInTheDocument();
    });
  });

  test(
    'should support typeahead filtering on single-select (multiplechoice) survey questions',
    { timeout: 15000 },
    async () => {
      const user = userEvent.setup();
      renderSurveyStep(server, '456', testSurveys.withColons);

      await waitFor(() => {
        expect(screen.getByText('Environment Selection')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /select option/i }));

      await waitFor(() => {
        expect(screen.getByText('production: Main production environment')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', { name: 'Search input' });
      await user.click(searchInput);
      await user.paste('staging');

      await waitFor(() => {
        expect(screen.getByText('staging: Testing environment')).toBeInTheDocument();
        expect(
          screen.queryByText('production: Main production environment')
        ).not.toBeInTheDocument();
        expect(screen.queryByText('development: Local development')).not.toBeInTheDocument();
      });
    }
  );
});
