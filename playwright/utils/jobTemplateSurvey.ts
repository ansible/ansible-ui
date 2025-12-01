import { Job } from '@ansible/awx-ui/interfaces/Job';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Survey } from '@ansible/awx-ui/interfaces/Survey';
import { awxAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { navigateTo } from '../commands/navigateTo';
import { Page, expect } from '@playwright/test';

export interface SurveyQuestion {
  question_name: string;
  question_description: string;
  variable: string;
  default: string | number;
  type: 'text' | 'textarea' | 'password' | 'integer' | 'float' | 'multiplechoice' | 'multiselect';
  max?: number;
  min?: number;
  required?: boolean;
  choices?: string[];
}

export const JobTemplateSurvey = {
  api: {
    createQuestion: async (
      page: Page,
      jobTemplateName: string,
      question: SurveyQuestion
    ): Promise<void> => {
      const templates = await awxAPI.get<{ results: JobTemplate[] }>(
        page,
        `/job_templates/?name=${jobTemplateName}`
      );
      if (!templates?.results?.length) {
        throw new Error(`Job template ${jobTemplateName} not found`);
      }
      const jobTemplate = templates.results[0];

      const existingSurvey = await awxAPI.get<Survey>(
        page,
        `/job_templates/${jobTemplate.id}/survey_spec/`
      );

      const spec: Survey['spec'][0] = {
        question_name: question.question_name,
        question_description: question.question_description,
        variable: question.variable,
        type: question.type,
        required: question.required ?? true,
        min: question.min ?? 0,
        max: question.max ?? 1024,
        default: question.default,
        choices: question.choices ?? [],
        new_question: true,
      };

      const updatedSurvey: Survey = {
        name: existingSurvey?.name ?? '',
        description: existingSurvey?.description ?? '',
        spec: [...(existingSurvey?.spec ?? []), spec],
      };

      await awxAPI.post<Survey>(
        page,
        `/job_templates/${jobTemplate.id}/survey_spec/`,
        updatedSurvey,
        {
          expectStatus: 200,
        }
      );
    },

    createMultipleQuestions: async (
      page: Page,
      jobTemplateName: string,
      questions: SurveyQuestion[]
    ): Promise<void> => {
      const templates = await awxAPI.get<{ results: JobTemplate[] }>(
        page,
        `/job_templates/?name=${jobTemplateName}`
      );
      if (!templates?.results?.length) {
        throw new Error(`Job template ${jobTemplateName} not found`);
      }
      const jobTemplate = templates.results[0];

      const existingSurvey = await awxAPI.get<Survey>(
        page,
        `/job_templates/${jobTemplate.id}/survey_spec/`
      );

      const specs: Survey['spec'] = questions.map((question) => ({
        question_name: question.question_name,
        question_description: question.question_description,
        variable: question.variable,
        type: question.type,
        required: question.required ?? true,
        min: question.min ?? 0,
        max: question.max ?? 1024,
        default: question.default,
        choices: question.choices ?? [],
        new_question: true,
      }));

      const updatedSurvey: Survey = {
        name: existingSurvey?.name ?? '',
        description: existingSurvey?.description ?? '',
        spec: [...(existingSurvey?.spec ?? []), ...specs],
      };

      await awxAPI.post<Survey>(
        page,
        `/job_templates/${jobTemplate.id}/survey_spec/`,
        updatedSurvey,
        {
          expectStatus: 200,
        }
      );
    },
  },

  ui: {
    navigateToSurveyTab: async (page: Page, jobTemplateName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
        timeout: 5000,
      });
      await clickTableRow({ text: jobTemplateName, clearFilters: true }, page);
      await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
      await page.getByRole('tab', { name: 'Survey' }).click();
      await expect(page.getByRole('tab', { name: 'Survey' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    },

    enableSurvey: async (page: Page, jobTemplateName: string): Promise<void> => {
      await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplateName);
      const surveySwitch = page.getByTestId('survey-switch');
      const isChecked = await surveySwitch.isChecked();
      if (!isChecked) {
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/job_templates/') &&
            response.request().method() === 'PATCH' &&
            response.status() === 200
        );
        await surveySwitch.click({ force: true });
        await responsePromise;
      }
      await expect(surveySwitch).toBeChecked();
    },

    launchWithPrompt: async (
      page: Page,
      jobTemplateName: string,
      question: SurveyQuestion
    ): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
        timeout: 5000,
      });
      await clickTableRow({ text: jobTemplateName, clearFilters: true }, page);
      await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();

      const launchResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/launch/') &&
          response.request().method() === 'GET' &&
          response.status() === 200
      );
      await page.getByRole('button', { name: 'Launch template', exact: true }).click();
      await launchResponsePromise;
      await expect(
        page.getByRole('heading', { name: 'Prompt on Launch', exact: true })
      ).toBeVisible();
      await expect(page.getByLabel('Steps').getByRole('list')).toContainText('Survey');
      await expect(page.getByText(question.question_name).first()).toBeVisible();
      return `survey-${question.type}-answer-form-group`;
    },

    finishLaunch: async (page: Page, question: SurveyQuestion): Promise<void> => {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      const codeBlock = page.getByRole('code');
      await expect(codeBlock).toBeVisible();
      await expect(codeBlock).toContainText(question.variable);

      if (question.type === 'password') {
        await expect(codeBlock).toContainText('$encrypted$');
      } else {
        const defaults = question.default.toString().split('\n');
        for (const def of defaults) {
          await expect(codeBlock).toContainText(def);
        }
      }

      const launchResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/launch/') &&
          response.request().method() === 'POST' &&
          response.status() === 201
      );
      await page.getByRole('button', { name: /^Finish/ }).click();
      const launchResponse = await launchResponsePromise;
      const job = (await launchResponse.json()) as Job;

      if (job.type === 'job') {
        await JobTemplateSurvey.ui.waitForJobStatus(page, job.id.toString());
      } else {
        await JobTemplateSurvey.ui.waitForWorkflowJobStatus(page, job.id.toString());
      }

      await expect(page.getByText('Success')).toBeVisible({ timeout: 10000 });
    },

    waitForJobStatus: async (page: Page, jobId: string, maxRetries = 200): Promise<void> => {
      for (let i = 0; i < maxRetries; i++) {
        const response = await awxAPI.get<Job>(page, `/jobs/${jobId}/`);
        if (response?.status && ['successful', 'failed', 'canceled'].includes(response.status)) {
          return;
        }
        await page.waitForTimeout(500);
      }
      throw new Error(`Job ${jobId} did not reach final status within timeout`);
    },

    waitForWorkflowJobStatus: async (
      page: Page,
      jobId: string,
      maxRetries = 200
    ): Promise<void> => {
      for (let i = 0; i < maxRetries; i++) {
        const response = await awxAPI.get<Job>(page, `/workflow_jobs/${jobId}/`);
        if (response?.status && ['successful', 'failed', 'canceled'].includes(response.status)) {
          return;
        }
        await page.waitForTimeout(500);
      }
      throw new Error(`Workflow job ${jobId} did not reach final status within timeout`);
    },
  },
} as const;
