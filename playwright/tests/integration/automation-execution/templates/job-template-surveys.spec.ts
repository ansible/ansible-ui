import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';
import {
  Organization,
  Inventory,
  Project,
  JobTemplate,
  type SurveyQuestion,
} from '@ansible/playwright/utils';
import { JobTemplateSurvey } from '@ansible/playwright/utils/templateSurvey';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { Project as ProjectType } from '@ansible/awx-ui/interfaces/Project';
import { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import { JobTemplate as JobTemplateType } from '@ansible/awx-ui/interfaces/JobTemplate';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Job Templates Surveys', () => {
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

    let organization: OrganizationType;
    let project: ProjectType;
    let inventory: InventoryType;
    let jobTemplate: JobTemplateType;

    test.beforeEach(async ({ page }) => {
      organization = await Organization.api.create(page);
      inventory = await Inventory.api.create(page, { organization: organization.id });
      project = await Project.api.create(page, { organization: organization.id });
      await Project.api.sync(page, project.id);
      jobTemplate = await JobTemplate.api.create(page, {
        inventoryId: inventory.id,
        projectId: project.id,
        playbook: 'hello_world.yml',
      });
    });

    test.afterEach(async ({ page }) => {
      await JobTemplate.api.delete(page, jobTemplate.id).catch(() => {});
      await Inventory.api.delete(page, inventory.id).catch(() => {});
      await Project.api.delete(page, project.id).catch(() => {});
      await Organization.api.delete(page, organization.id).catch(() => {});
    });

    test(
      'can create a required survey from surveys tab list of a JT, toggle survey on, and assert info on surveys list view',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
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
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.api.createQuestion(page, jobTemplate.name, question);
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
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
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.api.createQuestion(page, jobTemplate.name, question);
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
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
      'should show validation error when minimum length exceeds maximum length for text type',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
        await page.getByRole('link', { name: 'Create survey question', exact: true }).click();

        // Fill required fields
        await page.getByTestId('question-name').fill('Test Question');
        await page.getByTestId('question-variable').fill('test_var');

        // Set minimum length greater than maximum length
        await page.getByTestId('question-min').fill('100');
        await page.getByTestId('question-max').fill('50');

        // Click elsewhere to trigger validation
        await page.getByTestId('question-name').click();

        // Verify validation errors appear
        await expect(
          page.getByText('Minimum length must be less than or equal to maximum length.')
        ).toBeVisible();
        await expect(
          page.getByText('Maximum length must be greater than or equal to minimum length.')
        ).toBeVisible();
      }
    );

    test(
      'should show validation error when minimum exceeds maximum for integer type',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
        await page.getByRole('link', { name: 'Create survey question', exact: true }).click();

        // Fill required fields
        await page.getByTestId('question-name').fill('Integer Question');
        await page.getByTestId('question-variable').fill('int_var');

        // Change answer type to Integer
        await page.getByTestId('question-type').click();
        await page.getByRole('option', { name: 'Integer' }).click();

        // Set minimum greater than maximum
        await page.getByTestId('question-min').fill('100');
        await page.getByTestId('question-max').fill('50');

        // Click elsewhere to trigger validation
        await page.getByTestId('question-name').click();

        // Verify validation errors appear (without "length" in the message for numeric types)
        await expect(
          page.getByText('Minimum must be less than or equal to maximum.')
        ).toBeVisible();
        await expect(
          page.getByText('Maximum must be greater than or equal to minimum.')
        ).toBeVisible();
      }
    );

    test(
      'should clear validation error when min/max values are corrected',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
        await page.getByRole('link', { name: 'Create survey question', exact: true }).click();

        // Fill required fields
        await page.getByTestId('question-name').fill('Test Question');
        await page.getByTestId('question-variable').fill('test_var');

        // Set invalid min/max (min > max)
        await page.getByTestId('question-min').fill('100');
        await page.getByTestId('question-max').fill('50');
        await page.getByTestId('question-name').click();

        // Verify error appears
        await expect(
          page.getByText('Minimum length must be less than or equal to maximum length.')
        ).toBeVisible();

        // Fix by increasing max above min
        await page.getByTestId('question-max').fill('200');
        await page.getByTestId('question-name').click();

        // Verify error is gone
        await expect(
          page.getByText('Minimum length must be less than or equal to maximum length.')
        ).not.toBeVisible();
        await expect(
          page.getByText('Maximum length must be greater than or equal to minimum length.')
        ).not.toBeVisible();
      }
    );

    test(
      'should validate text answer by length not numeric value (01 is valid for length 2)',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page }) => {
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
        await page.getByRole('link', { name: 'Create survey question', exact: true }).click();

        // Fill required fields
        await page.getByTestId('question-name').fill('Text Length Test');
        await page.getByTestId('question-variable').fill('text_length_var');

        // Set min and max length to 2
        await page.getByTestId('question-min').fill('2');
        await page.getByTestId('question-max').fill('2');

        // Enter "01" as default answer - this has length 2 and should be valid
        // even though numerically it might be interpreted as 1
        await page.getByTestId('question-default').fill('01');
        await page.getByTestId('question-name').click();

        // Verify no validation errors for the default answer
        await expect(page.getByText(/must be less than/i)).not.toBeVisible();
        await expect(page.getByText(/must be greater/i)).not.toBeVisible();
        await expect(page.getByText(/cannot be greater than/i)).not.toBeVisible();

        // Verify the Create button is enabled (form is valid)
        await expect(
          page.getByRole('button', { name: 'Create survey question', exact: true })
        ).toBeEnabled();

        // Actually create the survey to confirm it works
        const createResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/survey_spec/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        );
        await page.getByRole('button', { name: 'Create survey question', exact: true }).click();
        await createResponsePromise;

        // Verify we're back on the survey tab with the created question
        await expect(page.getByTestId('row-0')).toBeVisible();
        await expect(page.getByText('Text Length Test', { exact: true })).toBeVisible();
        await expect(page.getByText('01', { exact: true })).toBeVisible();
      }
    );

    test(
      'can create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys',
      { tag: ['@not_mock', '@tier1'] },
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
        await JobTemplateSurvey.api.createMultipleQuestions(page, jobTemplate.name, specs);
        await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
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
    let organization: OrganizationType;
    let project: ProjectType;
    let inventory: InventoryType;
    let jobTemplate: JobTemplateType;

    test.beforeEach(async ({ page }) => {
      organization = await Organization.api.create(page);
      inventory = await Inventory.api.create(page, { organization: organization.id });
      project = await Project.api.create(page, { organization: organization.id });
      await Project.api.sync(page, project.id);
      jobTemplate = await JobTemplate.api.create(page, {
        inventoryId: inventory.id,
        projectId: project.id,
        playbook: 'hello_world.yml',
      });
    });

    test.afterEach(async ({ page }) => {
      await JobTemplate.api.delete(page, jobTemplate.id).catch(() => {});
      await Inventory.api.delete(page, inventory.id).catch(() => {});
      await Project.api.delete(page, project.id).catch(() => {});
      await Organization.api.delete(page, organization.id).catch(() => {});
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
        { tag: ['@not_mock', '@tier1'] },
        async ({ page }) => {
          test.setTimeout(5 * 60 * 1000);
          await JobTemplateSurvey.api.createQuestion(page, jobTemplate.name, surveyType.question);
          await JobTemplateSurvey.ui.enableSurvey(page, jobTemplate.name);
          await JobTemplateSurvey.ui.launchWithPrompt(page, jobTemplate.name, surveyType.question);

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

          await JobTemplateSurvey.ui.finishLaunch(page, surveyType.question);
        }
      );
    }
  });
});
