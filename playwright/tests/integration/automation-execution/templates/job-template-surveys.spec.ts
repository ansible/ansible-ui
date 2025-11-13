import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';
import {
  createOrganization,
  deleteOrganization,
} from '../../access-management/organizations/organization-utils';
import { createInventory, deleteInventory } from '../infrastructure/inventories/inventory-utils';
import { createAwxProject, deleteAwxProject } from '../projects/project-utils';
import {
  createMultipleSurveyQuestionsAPI,
  createSurveyQuestionAPI,
  enableSurvey,
  finishSurveyLaunch,
  launchSurveyWithPrompt,
  navigateToTemplateSurveyTab,
  type SurveyQuestion,
} from './job-template-survey-utils';
import { createJobTemplate, deleteJobTemplate } from './job-template-utils';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Job Templates Surveys', () => {
  const organizationName = createE2EName('org');
  const projectName = createE2EName('project');

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupBefore({ path: '/' })({ page });
    await createOrganization(page, { organizationName });
    await createAwxProject({ organizationName, projectName }, page);
    await context.close();
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupBefore({ path: '/' })({ page });
    await deleteAwxProject(projectName, page);
    await deleteOrganization(organizationName, page);
    await context.close();
  });

  test.describe('JT Surveys: Create, Edit and Delete', () => {
    const question: SurveyQuestion = {
      question_name: "Who's that?",
      question_description: 'The person behind this.',
      variable: 'who_is_that',
      default: 'John Doe',
      type: 'text',
      max: 1024,
      min: 0,
      required: true,
      choices: [],
    };

    let inventoryName: string;
    let jobTemplateName: string;

    test.beforeEach(async ({ page }) => {
      inventoryName = await createInventory({ organizationName }, page);
      jobTemplateName = await createJobTemplate(
        {
          inventoryName: inventoryName,
          projectName: projectName,
        },
        page
      );
    });

    test.afterEach(async ({ page }) => {
      await deleteJobTemplate(jobTemplateName, page);
      await deleteInventory(inventoryName, page);
    });

    test(
      'can create a required survey from surveys tab list of a JT, toggle survey on, and assert info on surveys list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateToTemplateSurveyTab(jobTemplateName, page);
        await expect(
          page.getByText('There are currently no survey questions.', { exact: true })
        ).toBeVisible();
        await expect(
          page.getByText('Create a survey question by clicking the button below.', { exact: true })
        ).toBeVisible();
        await page.getByRole('link', { name: 'Create survey question', exact: true }).click();
        await page.getByTestId('question-name').fill(question.question_name);
        await page.getByTestId('question-description').fill(question.question_description);
        await page.getByTestId('question-variable').fill(question.variable);
        await page.getByTestId('question-default').fill(question.default.toString());
        const createResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/survey_spec/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        );
        await page.getByRole('button', { name: 'Create survey question', exact: true }).click();
        await createResponsePromise;
        const surveySwitch = page.getByTestId('survey-switch');
        await expect(surveySwitch).not.toBeChecked();
        const enableResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/job_templates/') &&
            response.request().method() === 'PATCH' &&
            response.status() === 200
        );
        await surveySwitch.click({ force: true });
        await enableResponsePromise;
        await expect(surveySwitch).toBeChecked();
        const row0 = page.getByTestId('row-0');
        await expect(row0.getByText(question.question_name, { exact: true })).toBeVisible();
        await expect(row0.getByText(question.type, { exact: true })).toBeVisible();
      }
    );

    test(
      'can edit a JT survey from surveys list view and assert info on surveys list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await createSurveyQuestionAPI(page, jobTemplateName, question);
        await navigateToTemplateSurveyTab(jobTemplateName, page);
        const row0 = page.getByTestId('row-0');
        await expect(
          row0.getByTestId('name-column-cell').getByText(question.question_name, { exact: true })
        ).toBeVisible();
        await expect(
          row0.getByTestId('type-column-cell').getByText(question.type, { exact: true })
        ).toBeVisible();
        await expect(
          row0
            .getByTestId('default-column-cell')
            .getByText(question.default.toString(), { exact: true })
        ).toBeVisible();
        // Click question name link to navigate to edit page
        await row0.getByRole('link', { name: question.question_name }).click();
        await page.waitForURL(/\/survey\/edit\?/);
        await expect(page.getByTestId('question-name')).toBeVisible();
        await page.getByTestId('question-name').clear();
        await page.getByTestId('question-name').fill('foo');
        await page.getByTestId('question-description').clear();
        await page.getByTestId('question-type').click();
        await page.getByRole('option', { name: 'Integer' }).click();
        await page.getByTestId('question-max').clear();
        await page.getByTestId('question-max').fill('2000');
        await page.getByTestId('question-default').clear();
        await page.getByTestId('question-default').fill('1337');
        const saveResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/survey_spec/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        );
        await page.getByRole('button', { name: 'Save survey question', exact: true }).click();
        await saveResponsePromise;
        // Verify we're back on the survey tab with the updated question
        await page.waitForURL(/\/survey$/);
        await expect(page.getByTestId('row-0')).toBeVisible();
        await expect(page.getByText('foo', { exact: true })).toBeVisible();
        await expect(page.getByText('integer', { exact: true })).toBeVisible();
      }
    );

    test(
      'can delete a JT survey from the surveys list view and assert deletion',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await createSurveyQuestionAPI(page, jobTemplateName, question);
        await navigateToTemplateSurveyTab(jobTemplateName, page);
        const row0 = page.getByTestId('row-0');
        await expect(row0.getByText(question.question_name, { exact: true })).toBeVisible();
        await expect(row0.getByText(question.default.toString(), { exact: true })).toBeVisible();
        await expect(row0.getByText('text', { exact: true })).toBeVisible();
        await row0.getByLabel('kebab dropdown toggle').click();
        await page.getByRole('menuitem', { name: 'Delete survey question' }).click();
        const deleteDialog = page.getByTestId('delete-survey-dialog');
        await expect(deleteDialog).toBeVisible();
        await page.locator('#confirm').check();
        await page.getByTestId('survey-modal-delete-button').click();
        // Wait for dialog to close
        await expect(deleteDialog).not.toBeVisible();
        await expect(
          page.getByText('There are currently no survey questions.', { exact: true })
        ).toBeVisible();
        await expect(
          page.getByText('Create a survey question by clicking the button below.', { exact: true })
        ).toBeVisible();
      }
    );

    test(
      'can create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const specs: SurveyQuestion[] = [
          {
            question_name: 'Foo',
            question_description: 'this is Foo.',
            variable: 'foo',
            default: 'John Doe',
            type: 'text',
            max: 1024,
            min: 0,
            required: true,
            choices: [],
          },
          {
            question_name: 'Bar',
            question_description: 'this is Bar.',
            variable: 'bar',
            default: 'Jane Doe',
            type: 'text',
            max: 1024,
            min: 0,
            required: true,
            choices: [],
          },
          {
            question_name: 'Baz',
            question_description: 'this is Baz.',
            variable: 'baz',
            default: 'Baby Doe',
            type: 'text',
            max: 1024,
            min: 0,
            required: true,
            choices: [],
          },
        ];
        await createMultipleSurveyQuestionsAPI(page, jobTemplateName, specs);
        await navigateToTemplateSurveyTab(jobTemplateName, page);
        for (let index = 0; index < specs.length; index++) {
          const row = page.getByTestId(`row-${index}`);
          await expect(
            row
              .getByTestId('name-column-cell')
              .getByText(specs[index].question_name, { exact: true })
          ).toBeVisible();
          await expect(
            row.getByTestId('type-column-cell').getByText(specs[index].type, { exact: true })
          ).toBeVisible();
          await expect(
            row
              .getByTestId('default-column-cell')
              .getByText(specs[index].default.toString(), { exact: true })
          ).toBeVisible();
        }
        await page.getByLabel('toolbar actions').click();
        await page.getByRole('menuitem', { name: 'Manage question order' }).click();
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        const fooRow = modal.locator('#draggable-row-Foo');
        const bazRow = modal.locator('#draggable-row-Baz');
        await fooRow.dragTo(bazRow);
        const applyResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/survey_spec/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        );
        await page.getByRole('button', { name: 'Apply', exact: true }).click();
        await applyResponsePromise;
        // Wait for modal to close and table to refresh
        await expect(modal).not.toBeVisible();
        await page.waitForTimeout(500);
        const expectedOrder = ['Bar', 'Baz', 'Foo'];
        for (let index = 0; index < expectedOrder.length; index++) {
          const row = page.getByTestId(`row-${index}`);
          await expect(
            row.getByTestId('name-column-cell').getByText(expectedOrder[index], { exact: true })
          ).toBeVisible();
        }
        // Bulk delete all surveys
        await expect(page.getByRole('row', { name: 'Bar' })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Select all' }).click();
        await page.getByLabel('toolbar actions').click();
        await page.getByRole('menuitem', { name: 'Delete survey questions' }).click();
        const bulkDeleteDialog = page.getByTestId('delete-survey-dialog');
        await expect(bulkDeleteDialog).toBeVisible();
        await page.locator('#confirm').check();
        await page.getByTestId('survey-modal-delete-button').click();
        // Wait for dialog to close
        await expect(bulkDeleteDialog).not.toBeVisible();
        await expect(
          page.getByText('There are currently no survey questions.', { exact: true })
        ).toBeVisible();
      }
    );
  });

  test.describe('JT Surveys: Launch JT with Survey Enabled', () => {
    let inventoryName: string;
    let jobTemplateName: string;

    test.beforeEach(async ({ page }) => {
      inventoryName = await createInventory({ organizationName }, page);
      jobTemplateName = await createJobTemplate(
        {
          inventoryName: inventoryName,
          projectName: projectName,
        },
        page
      );
    });

    test.afterEach(async ({ page }) => {
      await deleteJobTemplate(jobTemplateName, page);
      await deleteInventory(inventoryName, page);
    });

    const surveyTypes: Array<{
      type: SurveyQuestion['type'];
      label: string;
      question: SurveyQuestion;
      expectedDefaultValue: string;
    }> = [
      {
        type: 'text',
        label: 'Text',
        question: {
          question_name: 'Text answer',
          question_description: 'Text description.',
          variable: 'text_answer',
          default: 'default text answer',
          type: 'text',
          max: 1024,
          min: 0,
          required: true,
          choices: [],
        },
        expectedDefaultValue: 'default text answer',
      },
      {
        type: 'textarea',
        label: 'Textarea',
        question: {
          question_name: 'Textarea answer',
          question_description: 'Textarea description.',
          variable: 'textarea_answer',
          default: 'default textarea answer',
          type: 'textarea',
          max: 1024,
          min: 0,
          required: true,
          choices: [],
        },
        expectedDefaultValue: 'default textarea answer',
      },
      {
        type: 'password',
        label: 'Password',
        question: {
          question_name: 'Password answer',
          question_description: 'Password description.',
          variable: 'password_answer',
          default: 'default password answer',
          type: 'password',
          max: 1024,
          min: 0,
          required: true,
          choices: [],
        },
        expectedDefaultValue: '$encrypted$',
      },
      {
        type: 'integer',
        label: 'Integer',
        question: {
          question_name: 'Integer answer',
          question_description: 'Integer description.',
          variable: 'integer_answer',
          default: 1337,
          type: 'integer',
          max: 1338,
          min: 0,
          required: true,
          choices: [],
        },
        expectedDefaultValue: '1337',
      },
      {
        type: 'float',
        label: 'Float',
        question: {
          question_name: 'Float answer',
          question_description: 'Float description.',
          variable: 'float_answer',
          default: 13.37,
          type: 'float',
          max: 1024,
          min: 0,
          required: true,
          choices: [],
        },
        expectedDefaultValue: '13.37',
      },
      {
        type: 'multiplechoice',
        label: 'Multiple Choice (single select)',
        question: {
          question_name: 'Multiplechoice answer',
          question_description: 'multiplechoice description.',
          variable: 'multiplechoice_answer',
          default: 'bar',
          type: 'multiplechoice',
          max: 1024,
          min: 0,
          required: true,
          choices: ['foo', 'bar', 'baz'],
        },
        expectedDefaultValue: 'bar',
      },
      {
        type: 'multiselect',
        label: 'Multiple Choice (multiple select)',
        question: {
          question_name: 'Multiselect answer',
          question_description: 'Multiselect description.',
          variable: 'multiselect_answer',
          default: 'foo\nbar',
          type: 'multiselect',
          max: 1024,
          min: 0,
          required: true,
          choices: ['foo', 'bar', 'baz'],
        },
        expectedDefaultValue: 'foo\nbar',
      },
    ];

    for (const surveyType of surveyTypes) {
      test(
        `can create ${surveyType.type} survey type, enable survey, launch JT, view default survey answer, complete launch, and assert survey answer on completed job`,
        { tag: ['@not_mock'] },
        async ({ page }) => {
          test.setTimeout(5 * 60 * 1000);
          await createSurveyQuestionAPI(
            page,
            jobTemplateName,
            surveyType.question,
            surveyType.label
          );
          await enableSurvey(jobTemplateName, page);
          await launchSurveyWithPrompt(jobTemplateName, surveyType.question, page);

          // Verify default value based on survey type
          if (surveyType.type === 'multiselect') {
            const defaults = surveyType.question.default.toString().split('\n');
            for (const defaultValue of defaults) {
              await expect(page.getByText(defaultValue, { exact: true })).toBeVisible();
            }
          } else if (surveyType.type !== 'multiplechoice') {
            // For non-select types, verify the default value
            const answerField = page.getByLabel(surveyType.question.question_name);
            await expect(answerField).toHaveValue(surveyType.expectedDefaultValue);
          }
          // For multiplechoice, the question visibility was already verified in launchSurveyWithPrompt

          await finishSurveyLaunch(surveyType.question, page);
        }
      );
    }
  });
});
