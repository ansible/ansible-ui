import { Job } from '@ansible/awx-ui/interfaces/Job';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
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

type TemplateType = 'job_templates' | 'workflow_job_templates';
type Template = JobTemplate | WorkflowJobTemplate;

export function createTemplateSurveyHelper(templateType: TemplateType) {
  return {
    api: {
      createQuestion: async (
        page: Page,
        templateName: string,
        question: SurveyQuestion
      ): Promise<void> => {
        const templates = await awxAPI.get<{ results: Template[] }>(
          page,
          `/${templateType}/?name=${templateName}`
        );
        if (!templates?.results?.length) {
          throw new Error(`Template ${templateName} not found`);
        }
        const template = templates.results[0];

        const existingSurvey = await awxAPI.get<Survey>(
          page,
          `/${templateType}/${template.id}/survey_spec/`
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
          `/${templateType}/${template.id}/survey_spec/`,
          updatedSurvey,
          {
            expectStatus: 200,
          }
        );
      },

      createMultipleQuestions: async (
        page: Page,
        templateName: string,
        questions: SurveyQuestion[]
      ): Promise<void> => {
        const templates = await awxAPI.get<{ results: Template[] }>(
          page,
          `/${templateType}/?name=${templateName}`
        );
        if (!templates?.results?.length) {
          throw new Error(`Template ${templateName} not found`);
        }
        const template = templates.results[0];

        const existingSurvey = await awxAPI.get<Survey>(
          page,
          `/${templateType}/${template.id}/survey_spec/`
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
          `/${templateType}/${template.id}/survey_spec/`,
          updatedSurvey,
          {
            expectStatus: 200,
          }
        );
      },
    },

    ui: {
      navigateToSurveyTab: async (page: Page, templateName: string): Promise<void> => {
        await navigateTo(page, 'Automation Execution', 'Templates');
        await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
          timeout: 5000,
        });
        await clickTableRow({ text: templateName, clearFilters: true }, page);
        await expect(page.getByRole('heading', { name: templateName, exact: true })).toBeVisible();
        await page.getByRole('tab', { name: 'Survey' }).click();
        await expect(page.getByRole('tab', { name: 'Survey' })).toHaveAttribute(
          'aria-selected',
          'true'
        );
      },

      createQuestion: async (
        page: Page,
        templateName: string,
        question: SurveyQuestion,
        skipNavigation = false
      ): Promise<void> => {
        if (!skipNavigation) {
          await navigateTo(page, 'Automation Execution', 'Templates');
          await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
            timeout: 5000,
          });
          await clickTableRow({ text: templateName, clearFilters: true }, page);
          await expect(
            page.getByRole('heading', { name: templateName, exact: true })
          ).toBeVisible();
          await page.getByRole('tab', { name: 'Survey' }).click();
          await expect(page.getByRole('tab', { name: 'Survey' })).toHaveAttribute(
            'aria-selected',
            'true'
          );
        }

        await expect(page.getByTestId('question-name')).not.toBeVisible({ timeout: 10000 });

        // Use or() to handle both empty state (link) and non-empty state (button)
        const createButtonOrLink = page
          .getByRole('button', { name: 'Create survey question', exact: true })
          .or(page.getByRole('link', { name: 'Create survey question', exact: true }));
        await createButtonOrLink.click();

        await page.getByTestId('question-name').fill(question.question_name);
        await page.getByTestId('question-description').fill(question.question_description);
        await page.getByTestId('question-variable').fill(question.variable);

        if (question.type !== 'text') {
          await page.getByTestId('question-type').click();
          const typeLabels: Record<SurveyQuestion['type'], string> = {
            text: 'Text',
            textarea: 'Textarea',
            password: 'Password',
            integer: 'Integer',
            float: 'Float',
            multiplechoice: 'Multiple Choice (single select)',
            multiselect: 'Multiple Choice (multiple select)',
          };
          await page.getByRole('option', { name: typeLabels[question.type] }).click();
        }

        if (['text', 'textarea', 'password', 'integer', 'float'].includes(question.type)) {
          if (question.min !== undefined) {
            await page.getByTestId('question-min').clear();
            await page.getByTestId('question-min').fill(question.min.toString());
          }

          if (question.max !== undefined) {
            await page.getByTestId('question-max').clear();
            await page.getByTestId('question-max').fill(question.max.toString());
          }

          await page.getByTestId('question-default').fill(question.default.toString());
        } else if (question.type === 'multiplechoice' || question.type === 'multiselect') {
          if (question.choices && question.choices.length > 0) {
            for (const choice of question.choices) {
              await page.getByTestId('add-choice-input').fill(choice);
              await page.getByTestId('add-choice').click();
            }

            const defaults =
              typeof question.default === 'string'
                ? question.default.split('\n')
                : [question.default.toString()];

            for (let i = 0; i < question.choices.length; i++) {
              if (defaults.includes(question.choices[i])) {
                const checkboxType =
                  question.type === 'multiplechoice' ? 'choice-radio' : 'choice-checkbox';
                await page.getByTestId(`${checkboxType}-${i}`).click();
              }
            }
          }
        }

        const createResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/survey_spec/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        );
        await page.getByRole('button', { name: 'Create survey question', exact: true }).click();
        await createResponsePromise;
        await expect(page.getByTestId('question-name')).not.toBeVisible({ timeout: 10000 });
      },

      enableSurvey: async (page: Page, templateName: string): Promise<void> => {
        await navigateTo(page, 'Automation Execution', 'Templates');
        await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
          timeout: 5000,
        });
        await clickTableRow({ text: templateName, clearFilters: true }, page);
        await expect(page.getByRole('heading', { name: templateName, exact: true })).toBeVisible();
        await page.getByRole('tab', { name: 'Survey' }).click();
        await expect(page.getByRole('tab', { name: 'Survey' })).toHaveAttribute(
          'aria-selected',
          'true'
        );

        const surveySwitch = page.getByTestId('survey-switch');
        const isChecked = await surveySwitch.isChecked();
        if (!isChecked) {
          const responsePromise = page.waitForResponse(
            (response) =>
              response.url().includes(`/${templateType}/`) &&
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
        templateName: string,
        question: SurveyQuestion
      ): Promise<string> => {
        await navigateTo(page, 'Automation Execution', 'Templates');
        await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
          timeout: 5000,
        });
        await clickTableRow({ text: templateName, clearFilters: true }, page);
        await expect(page.getByRole('heading', { name: templateName, exact: true })).toBeVisible();

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
          await createTemplateSurveyHelper(templateType).ui.waitForJobStatus(
            page,
            job.id.toString()
          );
        } else {
          await createTemplateSurveyHelper(templateType).ui.waitForWorkflowJobStatus(
            page,
            job.id.toString()
          );
        }

        const successStatus = page.getByText('Success');
        const failedStatus = page.getByText('Failed');
        const pendingStatus = page.getByText('Pending');
        await expect(successStatus.or(failedStatus).or(pendingStatus)).toBeVisible({
          timeout: 60_000,
        });
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
  };
}

export const JobTemplateSurvey = createTemplateSurveyHelper('job_templates');
export const WorkflowJobTemplateSurvey = createTemplateSurveyHelper('workflow_job_templates');
