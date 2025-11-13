import { Job } from '@ansible/awx-ui/interfaces/Job';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Survey } from '@ansible/awx-ui/interfaces/Survey';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
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

/**
 * Navigate to a job template's details page and open the Survey tab
 */
export async function navigateToTemplateSurveyTab(jobTemplateName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({ timeout: 5000 });
  await clickTableRow({ text: jobTemplateName, clearFilters: true }, page);
  await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Survey' }).click();
  await expect(page.getByRole('tab', { name: 'Survey' })).toHaveAttribute('aria-selected', 'true');
}

/**
 * Enable the survey toggle on the survey tab
 */
export async function enableSurvey(jobTemplateName: string, page: Page) {
  await navigateToTemplateSurveyTab(jobTemplateName, page);
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
}

/**
 * Launch a job template with survey prompt and navigate to the survey step
 * Returns the groupType string for the survey question form group
 */
export async function launchSurveyWithPrompt(
  jobTemplateName: string,
  question: SurveyQuestion,
  page: Page
): Promise<string> {
  // Navigate to template details page first
  await navigateTo(page, 'Automation Execution', 'Templates');
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({ timeout: 5000 });
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
  await expect(page.getByRole('heading', { name: 'Prompt on Launch', exact: true })).toBeVisible();
  // Wait for survey step to be visible
  await expect(page.getByLabel('Steps').getByRole('list')).toContainText('Survey');
  // Verify the question text is visible on the page (use first() to avoid strict mode violation)
  await expect(page.getByText(question.question_name).first()).toBeVisible();
  // Return the pattern used in Cypress for compatibility with test expectations
  return `survey-${question.type}-answer-form-group`;
}

/**
 * Complete the survey launch wizard, verify job completes, and verify survey answer in job details
 */
export async function finishSurveyLaunch(question: SurveyQuestion, page: Page) {
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

  // Wait for job to complete
  if (job.type === 'job') {
    await waitForJobStatus(job.id.toString(), page);
  } else {
    await waitForWorkflowJobStatus(job.id.toString(), page);
  }

  // Verify job completed successfully
  // The job output page should show success status
  await expect(page.getByText('Success')).toBeVisible({ timeout: 10000 });
}

/**
 * Wait for a job to reach a final status (successful, failed, or canceled)
 */
async function waitForJobStatus(jobId: string, page: Page, maxRetries = 200) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await awxAPI.get<Job>(page, `/jobs/${jobId}/`);
    if (response?.status && ['successful', 'failed', 'canceled'].includes(response.status)) {
      return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Job ${jobId} did not reach final status within timeout`);
}

/**
 * Wait for a workflow job to reach a final status (successful, failed, or canceled)
 */
async function waitForWorkflowJobStatus(jobId: string, page: Page, maxRetries = 200) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await awxAPI.get<Job>(page, `/workflow_jobs/${jobId}/`);
    if (response?.status && ['successful', 'failed', 'canceled'].includes(response.status)) {
      return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Workflow job ${jobId} did not reach final status within timeout`);
}

/**
 * Create a survey question via API
 * This is a helper function for tests that need to create surveys programmatically
 */
export async function createSurveyQuestionAPI(
  page: Page,
  jobTemplateName: string,
  question: SurveyQuestion,
  _typeLabel?: string
): Promise<void> {
  // Get job template by name to get its ID
  const templates = await awxAPI.get<{ results: JobTemplate[] }>(
    page,
    `/job_templates/?name=${jobTemplateName}`
  );
  if (!templates?.results?.length) {
    throw new Error(`Job template ${jobTemplateName} not found`);
  }
  const jobTemplate = templates.results[0];

  // Get existing survey spec
  const existingSurvey = await awxAPI.get<Survey>(
    page,
    `/job_templates/${jobTemplate.id}/survey_spec/`
  );

  // Prepare the new question spec
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

  // Add the new question to existing survey
  const updatedSurvey: Survey = {
    name: existingSurvey?.name ?? '',
    description: existingSurvey?.description ?? '',
    spec: [...(existingSurvey?.spec ?? []), spec],
  };

  // POST updated survey (returns 200, not 201)
  await awxAPI.post<Survey>(page, `/job_templates/${jobTemplate.id}/survey_spec/`, updatedSurvey, {
    expectStatus: 200,
  });
}

/**
 * Create multiple survey questions via API
 */
export async function createMultipleSurveyQuestionsAPI(
  page: Page,
  jobTemplateName: string,
  questions: SurveyQuestion[]
): Promise<void> {
  // Get job template by name to get its ID
  const templates = await awxAPI.get<{ results: JobTemplate[] }>(
    page,
    `/job_templates/?name=${jobTemplateName}`
  );
  if (!templates?.results?.length) {
    throw new Error(`Job template ${jobTemplateName} not found`);
  }
  const jobTemplate = templates.results[0];

  // Get existing survey spec
  const existingSurvey = await awxAPI.get<Survey>(
    page,
    `/job_templates/${jobTemplate.id}/survey_spec/`
  );

  // Prepare all question specs
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

  // Add all questions to existing survey
  const updatedSurvey: Survey = {
    name: existingSurvey?.name ?? '',
    description: existingSurvey?.description ?? '',
    spec: [...(existingSurvey?.spec ?? []), ...specs],
  };

  // POST updated survey (returns 200, not 201)
  await awxAPI.post<Survey>(page, `/job_templates/${jobTemplate.id}/survey_spec/`, updatedSurvey, {
    expectStatus: 200,
  });
}
