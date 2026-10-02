import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { SetupServer } from 'msw/node';
import { setupServer } from 'msw/node';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi, type Mock } from 'vitest';
import { Spec, Survey } from '../interfaces/Survey';
import {
  SurveyStep,
  buildSurveyConditionData,
  getSurveyPageLabel,
  getSurveyPages,
} from './SurveyStep';
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

function surveyQuestion(overrides: Partial<Spec>): Spec {
  return {
    question_name: 'Question',
    question_description: '',
    required: false,
    type: 'text',
    variable: 'question',
    min: 0,
    max: 1024,
    default: '',
    choices: '',
    new_question: false,
    ...overrides,
  };
}

const conditionalSurvey: Survey = {
  name: 'Conditional survey',
  description: '',
  spec: [
    surveyQuestion({ question_name: 'Mode', variable: 'mode', default: 'internal' }),
    surveyQuestion({
      question_name: 'Database host',
      variable: 'db_host',
      required: true,
      conditions: [{ variable: 'mode', operator: 'eq', value: 'external' }],
    }),
  ],
};

const categorizedSurvey: Survey = {
  name: 'Categorized survey',
  description: '',
  spec: [
    surveyQuestion({ question_name: 'Hostname', variable: 'hostname', category: 'Network' }),
    surveyQuestion({ question_name: 'Owner', variable: 'owner' }),
    surveyQuestion({ question_name: 'CPU count', variable: 'cpus', category: 'Sizing', page: 2 }),
  ],
};

function renderWithSpec(
  server: SetupServer,
  survey: Survey,
  props: { pageNumber?: number; passSpec?: boolean; stepData?: Record<string, unknown> } = {},
  onForm?: (form: UseFormReturn) => void
) {
  const apiPath = awxAPI`/job_templates/55/survey_spec/`;
  let surveySpecRequests = 0;
  server.use(
    http.get(apiPath, () => {
      surveySpecRequests += 1;
      return HttpResponse.json(survey);
    }),
    http.options(apiPath, () => HttpResponse.json({ actions: { POST: {} } }))
  );

  vi.mocked(usePageWizard).mockReturnValue({
    wizardData: {
      resource: { id: 55, type: 'job_template', name: 'Test Template', description: '' },
    },
    stepData: props.stepData ?? {},
  } as unknown as ReturnType<typeof usePageWizard>);

  function FormExposer({ children }: { children: React.ReactNode }) {
    const form = useForm();
    onForm?.(form);
    return <FormProvider {...form}>{children}</FormProvider>;
  }

  render(
    <FormExposer>
      <SurveyStep
        templateId="55"
        pageNumber={props.pageNumber}
        surveySpecData={props.passSpec ? survey : undefined}
      />
    </FormExposer>
  );

  return { getSurveySpecRequests: () => surveySpecRequests };
}

describe('SurveyStep conditional surveys', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('hides a question until its condition is met', async () => {
    const user = userEvent.setup();
    renderWithSpec(server, conditionalSurvey);

    await waitFor(() => expect(screen.getByLabelText('Mode')).toHaveValue('internal'));
    expect(screen.queryByLabelText(/Database host/)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Mode'));
    await user.type(screen.getByLabelText('Mode'), 'external');

    await waitFor(() => expect(screen.getByLabelText(/Database host/)).toBeInTheDocument());

    await user.clear(screen.getByLabelText('Mode'));
    await user.type(screen.getByLabelText('Mode'), 'internal');

    await waitFor(() => expect(screen.queryByLabelText(/Database host/)).not.toBeInTheDocument());
  });

  test('unregisters hidden questions so they are not validated or submitted', async () => {
    let form: UseFormReturn | undefined;
    renderWithSpec(server, conditionalSurvey, {}, (f) => (form = f));

    await waitFor(() => expect(screen.getByLabelText('Mode')).toHaveValue('internal'));

    await waitFor(async () => {
      expect(await form?.trigger()).toBe(true);
    });
    expect(form?.getValues('survey')).toEqual({ mode: 'internal' });
  });

  test('restores answers from the owning wizard step and splits multiselect defaults', async () => {
    let form: UseFormReturn | undefined;
    const survey: Survey = {
      ...conditionalSurvey,
      spec: [
        ...conditionalSurvey.spec,
        surveyQuestion({
          question_name: 'Regions',
          variable: 'regions',
          type: 'multiselect',
          choices: ['eu', 'us'],
          default: 'eu\nus',
        }),
      ],
    };
    renderWithSpec(
      server,
      survey,
      { stepData: { survey: { survey: { mode: 'external', db_host: 'db1' } } } },
      (f) => (form = f)
    );

    await waitFor(() => expect(screen.getByLabelText('Mode')).toHaveValue('external'));
    expect(screen.getByLabelText(/Database host/)).toHaveValue('db1');
    expect(form?.getValues('survey')).toEqual({
      mode: 'external',
      db_host: 'db1',
      regions: ['eu', 'us'],
    });
  });

  test('groups categorized questions into titled cards', async () => {
    renderWithSpec(server, categorizedSurvey);

    await waitFor(() => expect(screen.getByText('Network')).toBeInTheDocument());
    expect(screen.getByText('Sizing')).toBeInTheDocument();
    expect(screen.getByLabelText('Hostname')).toBeInTheDocument();
    expect(screen.getByLabelText('Owner')).toBeInTheDocument();
    expect(screen.getByLabelText('CPU count')).toBeInTheDocument();
  });

  test('renders only the questions of the given page', async () => {
    renderWithSpec(server, categorizedSurvey, { pageNumber: 2 });

    await waitFor(() => expect(screen.getByLabelText('CPU count')).toBeInTheDocument());
    expect(screen.queryByLabelText('Hostname')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Owner')).not.toBeInTheDocument();
    expect(screen.queryByText('Network')).not.toBeInTheDocument();
  });

  test('does not fetch the survey spec when it is passed in', async () => {
    const { getSurveySpecRequests } = renderWithSpec(server, categorizedSurvey, {
      passSpec: true,
    });

    await waitFor(() => expect(screen.getByLabelText('Hostname')).toBeInTheDocument());
    expect(getSurveySpecRequests()).toBe(0);
  });
});

describe('getSurveyPages', () => {
  test('returns sorted unique pages, defaulting to page 1', () => {
    const spec = [
      surveyQuestion({ variable: 'a', page: 3 }),
      surveyQuestion({ variable: 'b' }),
      surveyQuestion({ variable: 'c', page: 1 }),
      surveyQuestion({ variable: 'd', page: 3 }),
    ];
    expect(getSurveyPages(spec)).toEqual([1, 3]);
  });

  test('returns an empty list for an empty spec', () => {
    expect(getSurveyPages([])).toEqual([]);
  });
});

describe('getSurveyPageLabel', () => {
  const spec = [
    surveyQuestion({ variable: 'a', category: 'Network' }),
    surveyQuestion({ variable: 'b', category: 'Storage' }),
    surveyQuestion({ variable: 'c', category: 'Network' }),
    surveyQuestion({ variable: 'd', page: 2 }),
  ];

  test('joins the unique categories on the page', () => {
    expect(getSurveyPageLabel(spec, 1)).toBe('Network, Storage');
  });

  test('returns undefined when the page has no categories', () => {
    expect(getSurveyPageLabel(spec, 2)).toBeUndefined();
    expect(getSurveyPageLabel(spec, 5)).toBeUndefined();
  });
});

describe('buildSurveyConditionData', () => {
  const spec = [
    surveyQuestion({ variable: 'p1', page: 1, default: 'p1-default' }),
    surveyQuestion({ variable: 'p2', page: 2, default: 'p2-default' }),
    surveyQuestion({ variable: 'empty', page: 2 }),
  ];

  test('prefers live values for the current page', () => {
    const data = buildSurveyConditionData(spec, {
      pageNumber: 1,
      liveValues: { p1: 'live', p2: 'stale-copy' },
      stepData: { survey_page_2: { survey: { p2: 'owned' } } },
    });
    expect(data).toEqual({ p1: 'live', p2: 'owned' });
  });

  test('falls back to wizard data and then to defaults', () => {
    const data = buildSurveyConditionData(spec, {
      pageNumber: 1,
      stepData: {},
      wizardSurvey: { p2: 'from-wizard' },
    });
    expect(data).toEqual({ p1: 'p1-default', p2: 'from-wizard' });
  });

  test('uses the single survey step when there are no pages', () => {
    const data = buildSurveyConditionData(spec, {
      stepData: { survey: { survey: { p1: 'single', p2: 'single-2' } } },
    });
    expect(data).toEqual({ p1: 'single', p2: 'single-2' });
  });
});
