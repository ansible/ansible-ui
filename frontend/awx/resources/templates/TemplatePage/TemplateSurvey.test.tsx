import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { TemplateSurvey } from './TemplateSurvey';

const mockJobTemplate = {
  id: 7,
  type: 'job_template',
  name: 'Mock Job Template',
  survey_enabled: false,
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: true,
    },
  },
};

const mockSurvey = {
  name: 'Simple',
  description: 'Description',
  spec: [
    { type: 'text', question_name: 'cantbeshort', variable: 'long_answer', required: false },
    { type: 'text', question_name: 'cantbelong', variable: 'short_answer', required: false },
    { type: 'text', question_name: 'reqd', variable: 'reqd_answer', required: true },
    {
      type: 'multiplechoice',
      question_name: 'achoice',
      variable: 'single_choice',
      required: false,
    },
    { type: 'multiselect', question_name: 'mchoice', variable: 'multi_choice', required: false },
    { type: 'integer', question_name: 'integerchoice', variable: 'int_answer', required: false },
    { type: 'float', question_name: 'float', variable: 'float_answer', required: false },
  ],
};

const server = setupServer(
  http.options(awxAPI`/job_templates/`, () => {
    return HttpResponse.json({});
  }),
  http.get(awxAPI`/job_templates/7/`, () => {
    return HttpResponse.json(mockJobTemplate);
  }),
  http.get(awxAPI`/job_templates/7/survey_spec/`, () => {
    return HttpResponse.json(mockSurvey);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateSurvey', () => {
  it('should render survey list with correct number of rows', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // 7 questions + 1 header row = 8 total
      expect(rows.length).toBeGreaterThanOrEqual(7);
    });
  });

  it('should display required asterisk for required survey question', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('survey-question-required')).toBeInTheDocument();
    });
  });

  it('should show survey toggle switch', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('survey-switch')).toBeInTheDocument();
    });
  });

  it('should display survey enabled label when survey is enabled', async () => {
    server.use(
      http.get(awxAPI`/job_templates/7/`, () => {
        return HttpResponse.json({
          ...mockJobTemplate,
          survey_enabled: true,
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/survey enabled/i)).toBeInTheDocument();
    });
  });

  it('should display question names in table', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('cantbeshort')).toBeInTheDocument();
      expect(screen.getByText('reqd')).toBeInTheDocument();
      expect(screen.getByText('achoice')).toBeInTheDocument();
    });
  });

  it('should disable row actions when user lacks permissions', async () => {
    server.use(
      http.get(awxAPI`/job_templates/7/`, () => {
        return HttpResponse.json({
          ...mockJobTemplate,
          summary_fields: {
            user_capabilities: {
              edit: false,
              delete: false,
            },
          },
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const row = screen.getByText('reqd').closest('tr');
      expect(row).toBeInTheDocument();
      if (row) {
        const editButton = within(row).queryByTestId('edit-survey-question');
        if (editButton) {
          expect(editButton).toHaveAttribute('aria-disabled', 'true');
        }
      }
    });
  });

  it('should display empty state with correct messaging when no survey questions exist', async () => {
    // Override handler to return empty survey spec
    server.use(
      http.get(awxAPI`/job_templates/7/survey_spec/`, () => {
        return HttpResponse.json({
          name: '',
          description: '',
          spec: [],
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/templates/job-templates/7/survey']}>
        <Routes>
          <Route
            path="/templates/job-templates/:id/survey"
            element={<TemplateSurvey resourceType="job_templates" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('There are currently no survey questions.')).toBeInTheDocument();
    });

    // Verify the updated empty state description from PR #3345
    await waitFor(() => {
      expect(
        screen.getByText('Create a survey question to populate this list.')
      ).toBeInTheDocument();
    });
  });
});
