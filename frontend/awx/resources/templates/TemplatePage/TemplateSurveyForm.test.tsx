/* eslint-disable i18next/no-literal-string */
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
  });
});
