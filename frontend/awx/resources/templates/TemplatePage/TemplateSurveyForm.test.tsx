import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import type { Survey, Spec } from '../../../interfaces/Survey';
import { TemplateSurveyForm } from './TemplateSurveyForm';
import { awxAPI } from '../../../common/api/awx-utils';

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
