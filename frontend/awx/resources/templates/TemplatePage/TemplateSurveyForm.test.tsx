import {
  validateMin,
  validateMax,
  isLengthType,
  ValidateMinMaxOptions,
  TemplateSurveyForm,
} from './TemplateSurveyForm';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import type { Survey, Spec } from '../../../interfaces/Survey';
import { awxAPI } from '../../../common/api/awx-utils';

// Identity function for translation in tests
const t = (s: string) => s;

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
  };
});

const createSurveyWithMultiselectQuestion = (
  options: {
    withDefault?: boolean;
    defaultValue?: string | string[] | null;
    type?: 'multiselect' | 'multiplechoice';
  } = {}
): Survey => {
  const { withDefault = true, defaultValue = 'option1', type = 'multiselect' } = options;

  const baseSpec: Partial<Spec> = {
    question_name: 'Test Multiselect Question',
    question_description: 'A test question',
    required: true,
    type,
    variable: 'test_variable',
    min: 0,
    max: 1024,
    choices: ['option1', 'option2', 'option3'],
    new_question: false,
  };

  if (withDefault) {
    (baseSpec as Spec).default = defaultValue as string;
  }

  return {
    name: 'Test Survey',
    description: 'Test Survey Description',
    spec: [baseSpec as Spec],
  };
};

const createSurveyWithTextQuestion = (
  options: { withDefault?: boolean; defaultValue?: string } = {}
): Survey => {
  const { withDefault = true, defaultValue = 'default text' } = options;

  const baseSpec: Partial<Spec> = {
    question_name: 'Test Text Question',
    question_description: 'A text question',
    required: false,
    type: 'text',
    variable: 'text_variable',
    min: 0,
    max: 1024,
    choices: '',
    new_question: false,
  };

  if (withDefault) {
    (baseSpec as Spec).default = defaultValue;
  }

  return {
    name: 'Test Survey',
    description: 'Test Survey Description',
    spec: [baseSpec as Spec],
  };
};

const DEFAULT_NUMERIC_OPTIONS = { type: 'integer' as const };
const createSurveyWithNumericQuestion = (
  options: { type: 'integer' | 'float'; defaultValue?: number } = DEFAULT_NUMERIC_OPTIONS
): Survey => {
  const { type, defaultValue = 42 } = options;

  return {
    name: 'Test Survey',
    description: 'Test Survey Description',
    spec: [
      {
        question_name: `Test ${type} Question`,
        question_description: `A ${type} question`,
        required: false,
        type,
        variable: 'int_variable',
        min: 0,
        max: 100,
        default: defaultValue,
        choices: '',
        new_question: false,
      },
    ],
  };
};

function renderSurveyForm(
  server: ReturnType<typeof setupServer>,
  survey: Survey,
  options: {
    mode: 'add' | 'edit';
    questionVariable?: string | null;
    resourceType?: 'job_templates' | 'workflow_job_templates';
  }
) {
  const { mode, questionVariable = null, resourceType = 'job_templates' } = options;
  const templateId = '123';
  const apiPath = awxAPI`/${resourceType}/${templateId}/survey_spec/`;

  server.use(http.get(apiPath, () => HttpResponse.json(survey)));

  return render(
    <MemoryRouter initialEntries={[`/templates/job_template/${templateId}/survey/${mode}`]}>
      <Routes>
        <Route
          path="/templates/job_template/:id/survey/:mode"
          element={
            <TemplateSurveyForm
              mode={mode}
              resourceType={resourceType}
              questionVariable={questionVariable}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// Test the actual validation functions
describe('TemplateSurveyForm - validateMin', () => {
  describe('for length types (text/textarea/password)', () => {
    const lengthType = true;

    test('should return error when min is null', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: null,
        maxRaw: 100,
        isLengthType: lengthType,
      };
      expect(validateMin(options, t)).toBe('Minimum length must be a valid number.');
    });

    test('should return error when min is undefined', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: undefined,
        maxRaw: 100,
        isLengthType: lengthType,
      };
      expect(validateMin(options, t)).toBe('Minimum length must be a valid number.');
    });

    test('should return error when min > max', () => {
      const options: ValidateMinMaxOptions = { minRaw: 100, maxRaw: 50, isLengthType: lengthType };
      expect(validateMin(options, t)).toBe(
        'Minimum length must be less than or equal to maximum length.'
      );
    });

    test('should return undefined when min <= max', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 100, isLengthType: lengthType };
      expect(validateMin(options, t)).toBeUndefined();
    });

    test('should return undefined when min equals max', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 50, isLengthType: lengthType };
      expect(validateMin(options, t)).toBeUndefined();
    });
  });

  describe('for numeric types (integer/float)', () => {
    const lengthType = false;

    test('should return error when min is null', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: null,
        maxRaw: 100,
        isLengthType: lengthType,
      };
      expect(validateMin(options, t)).toBe('Minimum must be a valid number.');
    });

    test('should return error when min is undefined', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: undefined,
        maxRaw: 100,
        isLengthType: lengthType,
      };
      expect(validateMin(options, t)).toBe('Minimum must be a valid number.');
    });

    test('should return error when min > max', () => {
      const options: ValidateMinMaxOptions = { minRaw: 100, maxRaw: 50, isLengthType: lengthType };
      expect(validateMin(options, t)).toBe('Minimum must be less than or equal to maximum.');
    });

    test('should return undefined when min <= max', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 100, isLengthType: lengthType };
      expect(validateMin(options, t)).toBeUndefined();
    });

    test('should return undefined when min equals max', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 50, isLengthType: lengthType };
      expect(validateMin(options, t)).toBeUndefined();
    });

    test('should allow negative values when min <= max', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: -100,
        maxRaw: 100,
        isLengthType: lengthType,
      };
      expect(validateMin(options, t)).toBeUndefined();
    });

    test('should return error when negative min > max', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: -10,
        maxRaw: -100,
        isLengthType: lengthType,
      };
      expect(validateMin(options, t)).toBe('Minimum must be less than or equal to maximum.');
    });
  });
});

describe('TemplateSurveyForm - validateMax', () => {
  describe('for length types (text/textarea/password)', () => {
    const lengthType = true;

    test('should return error when max is null', () => {
      const options: ValidateMinMaxOptions = { minRaw: 0, maxRaw: null, isLengthType: lengthType };
      expect(validateMax(options, t)).toBe('Maximum length must be a valid number.');
    });

    test('should return error when max is undefined', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: 0,
        maxRaw: undefined,
        isLengthType: lengthType,
      };
      expect(validateMax(options, t)).toBe('Maximum length must be a valid number.');
    });

    test('should return error when max < min', () => {
      const options: ValidateMinMaxOptions = { minRaw: 100, maxRaw: 50, isLengthType: lengthType };
      expect(validateMax(options, t)).toBe(
        'Maximum length must be greater than or equal to minimum length.'
      );
    });

    test('should return undefined when max >= min', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 100, isLengthType: lengthType };
      expect(validateMax(options, t)).toBeUndefined();
    });

    test('should return undefined when max equals min', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 50, isLengthType: lengthType };
      expect(validateMax(options, t)).toBeUndefined();
    });
  });

  describe('for numeric types (integer/float)', () => {
    const lengthType = false;

    test('should return error when max is null', () => {
      const options: ValidateMinMaxOptions = { minRaw: 0, maxRaw: null, isLengthType: lengthType };
      expect(validateMax(options, t)).toBe('Maximum must be a valid number.');
    });

    test('should return error when max is undefined', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: 0,
        maxRaw: undefined,
        isLengthType: lengthType,
      };
      expect(validateMax(options, t)).toBe('Maximum must be a valid number.');
    });

    test('should return error when max < min', () => {
      const options: ValidateMinMaxOptions = { minRaw: 100, maxRaw: 50, isLengthType: lengthType };
      expect(validateMax(options, t)).toBe('Maximum must be greater than or equal to minimum.');
    });

    test('should return undefined when max >= min', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 100, isLengthType: lengthType };
      expect(validateMax(options, t)).toBeUndefined();
    });

    test('should return undefined when max equals min', () => {
      const options: ValidateMinMaxOptions = { minRaw: 50, maxRaw: 50, isLengthType: lengthType };
      expect(validateMax(options, t)).toBeUndefined();
    });

    test('should allow negative values when max >= min', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: -100,
        maxRaw: -50,
        isLengthType: lengthType,
      };
      expect(validateMax(options, t)).toBeUndefined();
    });

    test('should return error when max < negative min', () => {
      const options: ValidateMinMaxOptions = {
        minRaw: -10,
        maxRaw: -100,
        isLengthType: lengthType,
      };
      expect(validateMax(options, t)).toBe('Maximum must be greater than or equal to minimum.');
    });
  });
});

// Test the isLengthType helper function
describe('TemplateSurveyForm - isLengthType', () => {
  test('text should be a length type', () => {
    expect(isLengthType('text')).toBe(true);
  });

  test('textarea should be a length type', () => {
    expect(isLengthType('textarea')).toBe(true);
  });

  test('password should be a length type', () => {
    expect(isLengthType('password')).toBe(true);
  });

  test('integer should NOT be a length type', () => {
    expect(isLengthType('integer')).toBe(false);
  });

  test('float should NOT be a length type', () => {
    expect(isLengthType('float')).toBe(false);
  });

  test('multiplechoice should NOT be a length type', () => {
    expect(isLengthType('multiplechoice')).toBe(false);
  });

  test('multiselect should NOT be a length type', () => {
    expect(isLengthType('multiselect')).toBe(false);
  });
});

describe('TemplateSurveyForm', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Edit Mode - Multiselect questions without default field', () => {
    test('should render edit form when multiselect question has no default field', async () => {
      const surveyWithoutDefault = createSurveyWithMultiselectQuestion({
        withDefault: false,
        type: 'multiselect',
      });

      renderSurveyForm(server, surveyWithoutDefault, {
        mode: 'edit',
        questionVariable: 'test_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue(
        'Test Multiselect Question'
      );
      expect(screen.getByRole('textbox', { name: /answer variable name/i })).toHaveValue(
        'test_variable'
      );
    });

    test('should render edit form when multiplechoice question has no default field', async () => {
      const surveyWithoutDefault = createSurveyWithMultiselectQuestion({
        withDefault: false,
        type: 'multiplechoice',
      });

      renderSurveyForm(server, surveyWithoutDefault, {
        mode: 'edit',
        questionVariable: 'test_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue(
        'Test Multiselect Question'
      );
    });

    test('should render edit form when multiselect question has null default', async () => {
      const surveyWithNullDefault = createSurveyWithMultiselectQuestion({
        withDefault: true,
        defaultValue: null,
        type: 'multiselect',
      });

      renderSurveyForm(server, surveyWithNullDefault, {
        mode: 'edit',
        questionVariable: 'test_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue(
        'Test Multiselect Question'
      );
    });

    test('should render edit form when multiselect question has empty string default', async () => {
      const surveyWithEmptyDefault = createSurveyWithMultiselectQuestion({
        withDefault: true,
        defaultValue: '',
        type: 'multiselect',
      });

      renderSurveyForm(server, surveyWithEmptyDefault, {
        mode: 'edit',
        questionVariable: 'test_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue(
        'Test Multiselect Question'
      );
    });

    test('should render edit form when multiselect question has array default', async () => {
      const surveyWithArrayDefault = createSurveyWithMultiselectQuestion({
        withDefault: true,
        defaultValue: ['option1', 'option2'],
        type: 'multiselect',
      });

      renderSurveyForm(server, surveyWithArrayDefault, {
        mode: 'edit',
        questionVariable: 'test_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue(
        'Test Multiselect Question'
      );
    });

    test('should render edit form when multiselect question has string default', async () => {
      const surveyWithStringDefault = createSurveyWithMultiselectQuestion({
        withDefault: true,
        defaultValue: 'option1\noption2',
        type: 'multiselect',
      });

      renderSurveyForm(server, surveyWithStringDefault, {
        mode: 'edit',
        questionVariable: 'test_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue(
        'Test Multiselect Question'
      );
    });
  });

  describe('Edit Mode - Text questions without default field', () => {
    test('should render edit form when text question has no default field', async () => {
      const surveyWithoutDefault = createSurveyWithTextQuestion({
        withDefault: false,
      });

      renderSurveyForm(server, surveyWithoutDefault, {
        mode: 'edit',
        questionVariable: 'text_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue('Test Text Question');
    });
  });

  describe('Add Mode', () => {
    test('should render add form with empty fields', async () => {
      const emptySurvey: Survey = {
        name: '',
        description: '',
        spec: [],
      };

      renderSurveyForm(server, emptySurvey, { mode: 'add' });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue('');
      expect(screen.getByRole('button', { name: /create survey question/i })).toBeInTheDocument();
    });

    test('should render answer variable name and description fields in add mode', async () => {
      const emptySurvey: Survey = { name: '', description: '', spec: [] };

      renderSurveyForm(server, emptySurvey, { mode: 'add' });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /answer variable name/i })).toBeInTheDocument();
    });

    test('should render answer type selector with all options', async () => {
      const emptySurvey: Survey = { name: '', description: '', spec: [] };

      renderSurveyForm(server, emptySurvey, { mode: 'add' });

      await waitFor(() => {
        expect(screen.getByText('Answer type')).toBeInTheDocument();
      });

      expect(screen.getByText('Answer type')).toBeInTheDocument();
    });

    test('should render required checkbox in add mode', async () => {
      const emptySurvey: Survey = { name: '', description: '', spec: [] };

      renderSurveyForm(server, emptySurvey, { mode: 'add' });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  describe('Edit Mode - Text question', () => {
    test('should render min/max length fields for text type', async () => {
      const textSurvey = createSurveyWithTextQuestion({
        withDefault: true,
        defaultValue: 'hello',
      });

      renderSurveyForm(server, textSurvey, {
        mode: 'edit',
        questionVariable: 'text_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Minimum length')).toBeInTheDocument();
      });

      expect(screen.getByText('Maximum length')).toBeInTheDocument();
      expect(screen.getByText('Default answer')).toBeInTheDocument();
    });
  });

  describe('Edit Mode - Integer question', () => {
    test('should render min/max fields for integer type', async () => {
      const intSurvey = createSurveyWithNumericQuestion({ type: 'integer' });

      renderSurveyForm(server, intSurvey, {
        mode: 'edit',
        questionVariable: 'int_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Minimum')).toBeInTheDocument();
      });

      expect(screen.getByText('Maximum')).toBeInTheDocument();
      expect(screen.getByText('Default answer')).toBeInTheDocument();
    });
  });

  describe('Edit Mode - Float question', () => {
    test('should render min/max fields for float type', async () => {
      const floatSurvey = createSurveyWithNumericQuestion({ type: 'float' });

      renderSurveyForm(server, floatSurvey, {
        mode: 'edit',
        questionVariable: 'int_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Minimum')).toBeInTheDocument();
      });

      expect(screen.getByText('Maximum')).toBeInTheDocument();
    });
  });

  describe('Edit Mode - Textarea question', () => {
    test('should render textarea default answer for textarea type', async () => {
      const textareaSurvey: Survey = {
        name: 'Test Survey',
        description: '',
        spec: [
          {
            question_name: 'Textarea Question',
            question_description: 'Enter notes',
            required: false,
            type: 'textarea',
            variable: 'textarea_var',
            min: 0,
            max: 4096,
            default: 'default notes',
            choices: '',
            new_question: false,
          },
        ],
      };

      renderSurveyForm(server, textareaSurvey, {
        mode: 'edit',
        questionVariable: 'textarea_var',
      });

      await waitFor(() => {
        expect(screen.getByText('Minimum length')).toBeInTheDocument();
      });

      expect(screen.getByText('Maximum length')).toBeInTheDocument();
      expect(screen.getByText('Default answer')).toBeInTheDocument();
    });
  });

  describe('Edit Mode - Password question', () => {
    test('should render password default answer for password type', async () => {
      const passwordSurvey: Survey = {
        name: 'Test Survey',
        description: '',
        spec: [
          {
            question_name: 'Password Question',
            question_description: 'Enter secret',
            required: true,
            type: 'password',
            variable: 'password_var',
            min: 0,
            max: 256,
            default: '',
            choices: '',
            new_question: false,
          },
        ],
      };

      renderSurveyForm(server, passwordSurvey, {
        mode: 'edit',
        questionVariable: 'password_var',
      });

      await waitFor(() => {
        expect(screen.getByText('Minimum length')).toBeInTheDocument();
      });

      expect(screen.getByText('Maximum length')).toBeInTheDocument();
      expect(screen.getByText('Default answer')).toBeInTheDocument();
    });
  });

  describe('Error and Loading states', () => {
    test('should render error when survey API fails', async () => {
      const templateId = '123';
      server.use(
        http.get(awxAPI`/job_templates/${templateId}/survey_spec/`, () =>
          HttpResponse.json({ detail: 'Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter initialEntries={[`/templates/job_template/${templateId}/survey/add`]}>
          <Routes>
            <Route
              path="/templates/job_template/:id/survey/:mode"
              element={<TemplateSurveyForm mode="add" resourceType="job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/detail: Server Error/)).toBeInTheDocument();
      });
    });

    test('should render loading state while fetching survey', async () => {
      const templateId = '123';
      server.use(
        http.get(awxAPI`/job_templates/${templateId}/survey_spec/`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return HttpResponse.json({ name: '', description: '', spec: [] });
        })
      );

      render(
        <MemoryRouter initialEntries={[`/templates/job_template/${templateId}/survey/add`]}>
          <Routes>
            <Route
              path="/templates/job_template/:id/survey/:mode"
              element={<TemplateSurveyForm mode="add" resourceType="job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Question')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode - Workflow job template resource type', () => {
    test('should render edit form for workflow job template survey', async () => {
      const textSurvey = createSurveyWithTextQuestion({ withDefault: true });

      renderSurveyForm(server, textSurvey, {
        mode: 'edit',
        questionVariable: 'text_variable',
        resourceType: 'workflow_job_templates',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /question/i })).toHaveValue('Test Text Question');
      expect(screen.getByRole('button', { name: /save survey question/i })).toBeInTheDocument();
    });
  });

  describe('Integer/Float Default Value of 0 Bug Fix', () => {
    const createSurveyWithIntegerQuestion = (
      options: { withDefault?: boolean; defaultValue?: number | string } = {}
    ): Survey => {
      const { withDefault = true, defaultValue = 10 } = options;

      const baseSpec: Partial<Spec> = {
        question_name: 'Test Integer Question',
        question_description: 'An integer question',
        required: false,
        type: 'integer',
        variable: 'integer_variable',
        min: 0,
        max: 1024,
        choices: '',
        new_question: false,
      };

      if (withDefault) {
        (baseSpec as Spec).default = defaultValue;
      }

      return {
        name: 'Test Survey',
        description: 'Test Survey Description',
        spec: [baseSpec as Spec],
      };
    };

    const createSurveyWithFloatQuestion = (
      options: { withDefault?: boolean; defaultValue?: number | string } = {}
    ): Survey => {
      const { withDefault = true, defaultValue = 5.5 } = options;

      const baseSpec: Partial<Spec> = {
        question_name: 'Test Float Question',
        question_description: 'A float question',
        required: false,
        type: 'float',
        variable: 'float_variable',
        min: 0,
        max: 100,
        choices: '',
        new_question: false,
      };

      if (withDefault) {
        (baseSpec as Spec).default = defaultValue;
      }

      return {
        name: 'Test Survey',
        description: 'Test Survey Description',
        spec: [baseSpec as Spec],
      };
    };

    test('should preserve integer default value of 0', async () => {
      const surveyWithZeroDefault = createSurveyWithIntegerQuestion({
        withDefault: true,
        defaultValue: 0,
      });

      renderSurveyForm(server, surveyWithZeroDefault, {
        mode: 'edit',
        questionVariable: 'integer_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      const defaultInput = screen.getByLabelText(/default answer/i);
      expect(defaultInput).toHaveValue(0);
    });

    test('should preserve float default value of 0', async () => {
      const surveyWithZeroDefault = createSurveyWithFloatQuestion({
        withDefault: true,
        defaultValue: 0,
      });

      renderSurveyForm(server, surveyWithZeroDefault, {
        mode: 'edit',
        questionVariable: 'float_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      const defaultInput = screen.getByLabelText(/default answer/i);
      expect(defaultInput).toHaveValue(0);
    });

    test('should preserve float default value of 0.0', async () => {
      const surveyWithZeroDefault = createSurveyWithFloatQuestion({
        withDefault: true,
        defaultValue: 0.0,
      });

      renderSurveyForm(server, surveyWithZeroDefault, {
        mode: 'edit',
        questionVariable: 'float_variable',
      });

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
      });

      const defaultInput = screen.getByLabelText(/default answer/i);
      expect(defaultInput).toHaveValue(0);
    });
  });
});
