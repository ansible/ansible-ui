import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';
import { WorkflowJobTemplate, type SurveyQuestion } from '@ansible/playwright/utils';
import { WorkflowJobTemplateSurvey } from '@ansible/playwright/utils/templateSurvey';
import { WorkflowJobTemplate as WorkflowJobTemplateType } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test.describe('Workflow Job Templates Surveys', () => {
  test.describe('WFJT Surveys: Create, Edit and Delete', () => {
    let workflowJobTemplate: WorkflowJobTemplateType;

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

    test.beforeEach(async ({ page }) => {
      workflowJobTemplate = await WorkflowJobTemplate.api.create(page);
    });

    test.afterEach(async ({ page }) => {
      await WorkflowJobTemplate.api.delete(page, workflowJobTemplate.id).catch(() => {});
    });

    test(
      'should create a required survey from surveys tab list of a WFJT, toggle survey on, and assert info on surveys list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to survey tab', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
        });

        await test.step('Verify empty state', async () => {
          await expect(
            page.getByText('There are currently no survey questions.', { exact: true })
          ).toBeVisible();
          await expect(
            page.getByText('Create a survey question by clicking the button below.', {
              exact: true,
            })
          ).toBeVisible();
        });

        await test.step('Create survey question', async () => {
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
        });

        await test.step('Enable survey and verify', async () => {
          const surveySwitch = page.getByTestId('survey-switch');
          await expect(surveySwitch).not.toBeChecked();
          const enableResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/workflow_job_templates/') &&
              response.request().method() === 'PATCH' &&
              response.status() === 200
          );
          await surveySwitch.click({ force: true });
          await enableResponsePromise;
          await expect(surveySwitch).toBeChecked();
        });

        await test.step('Verify question appears in list', async () => {
          const row0 = page.getByTestId('row-0');
          await expect(row0.getByText(question.question_name, { exact: true })).toBeVisible();
          await expect(row0.getByText(question.type, { exact: true })).toBeVisible();
        });
      }
    );

    test(
      'should edit a WFJT survey from surveys list view and assert info on surveys list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Create survey via API', async () => {
          await WorkflowJobTemplateSurvey.api.createQuestion(
            page,
            workflowJobTemplate.name,
            question
          );
        });

        await test.step('Navigate to survey tab and verify question', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
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
        });

        await test.step('Edit the question', async () => {
          const row0 = page.getByTestId('row-0');
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
        });

        await test.step('Verify updated question', async () => {
          await page.waitForURL(/\/survey$/);
          await expect(page.getByTestId('row-0')).toBeVisible();
          await expect(page.getByText('foo', { exact: true })).toBeVisible();
          await expect(page.getByText('integer', { exact: true })).toBeVisible();
        });
      }
    );

    test(
      'should delete a WFJT survey from the surveys list view and assert deletion',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Create survey via API', async () => {
          await WorkflowJobTemplateSurvey.api.createQuestion(
            page,
            workflowJobTemplate.name,
            question
          );
        });

        await test.step('Navigate to survey tab and verify question', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
          const row0 = page.getByTestId('row-0');
          await expect(row0.getByText(question.question_name, { exact: true })).toBeVisible();
          await expect(row0.getByText(question.default.toString(), { exact: true })).toBeVisible();
          await expect(row0.getByText('text', { exact: true })).toBeVisible();
        });

        await test.step('Delete the question', async () => {
          const row0 = page.getByTestId('row-0');
          await row0.getByLabel('kebab dropdown toggle').click();
          await page.getByRole('menuitem', { name: 'Delete survey question' }).click();
          const deleteDialog = page.getByTestId('delete-survey-dialog');
          await expect(deleteDialog).toBeVisible();
          await page.locator('#confirm').check();
          await page.getByTestId('survey-modal-delete-button').click();
          await expect(deleteDialog).not.toBeVisible();
        });

        await test.step('Verify empty state', async () => {
          await expect(
            page.getByText('There are currently no survey questions.', { exact: true })
          ).toBeVisible();
          await expect(
            page.getByText('Create a survey question by clicking the button below.', {
              exact: true,
            })
          ).toBeVisible();
        });
      }
    );

    test(
      'should create multiple surveys, assert order, change order, and assert new order, then bulk delete all surveys',
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

        await test.step('Create multiple surveys via API', async () => {
          await WorkflowJobTemplateSurvey.api.createMultipleQuestions(
            page,
            workflowJobTemplate.name,
            specs
          );
        });

        await test.step('Navigate to survey tab and verify order', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
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
        });

        await test.step('Reorder surveys', async () => {
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
          await expect(modal).not.toBeVisible();
          await page.waitForTimeout(500);
        });

        await test.step('Verify new order', async () => {
          const expectedOrder = ['Bar', 'Baz', 'Foo'];
          for (let index = 0; index < expectedOrder.length; index++) {
            const row = page.getByTestId(`row-${index}`);
            await expect(
              row.getByTestId('name-column-cell').getByText(expectedOrder[index], { exact: true })
            ).toBeVisible();
          }
        });

        await test.step('Bulk delete all surveys', async () => {
          await expect(page.getByRole('row', { name: 'Bar' })).toBeVisible();
          await page.getByRole('checkbox', { name: 'Select all' }).click();
          await page.getByLabel('toolbar actions').click();
          await page.getByRole('menuitem', { name: 'Delete survey questions' }).click();
          const bulkDeleteDialog = page.getByTestId('delete-survey-dialog');
          await expect(bulkDeleteDialog).toBeVisible();
          await page.locator('#confirm').check();
          await page.getByTestId('survey-modal-delete-button').click();
          await expect(bulkDeleteDialog).not.toBeVisible();
        });

        await test.step('Verify empty state', async () => {
          await expect(
            page.getByText('There are currently no survey questions.', { exact: true })
          ).toBeVisible();
        });
      }
    );

    test(
      'should show validation error when minimum length exceeds maximum length for text type',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to survey tab', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
        });

        await test.step('Open create survey question form', async () => {
          await page.getByRole('link', { name: 'Create survey question', exact: true }).click();
        });

        await test.step('Fill required fields with invalid min/max', async () => {
          await page.getByTestId('question-name').fill('Test Question');
          await page.getByTestId('question-variable').fill('test_var');

          // Set minimum length greater than maximum length
          await page.getByTestId('question-min').fill('100');
          await page.getByTestId('question-max').fill('50');

          // Click elsewhere to trigger validation
          await page.getByTestId('question-name').click();
        });

        await test.step('Verify validation errors appear', async () => {
          await expect(
            page.getByText('Minimum length must be less than or equal to maximum length.')
          ).toBeVisible();
          await expect(
            page.getByText('Maximum length must be greater than or equal to minimum length.')
          ).toBeVisible();
        });
      }
    );

    test(
      'should show validation error when minimum exceeds maximum for integer type',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to survey tab', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
        });

        await test.step('Open create survey question form', async () => {
          await page.getByRole('link', { name: 'Create survey question', exact: true }).click();
        });

        await test.step('Fill required fields and change to integer type', async () => {
          await page.getByTestId('question-name').fill('Integer Question');
          await page.getByTestId('question-variable').fill('int_var');

          // Change answer type to Integer
          await page.getByTestId('question-type').click();
          await page.getByRole('option', { name: 'Integer' }).click();
        });

        await test.step('Set invalid min/max values', async () => {
          // Set minimum greater than maximum
          await page.getByTestId('question-min').fill('100');
          await page.getByTestId('question-max').fill('50');

          // Click elsewhere to trigger validation
          await page.getByTestId('question-name').click();
        });

        await test.step('Verify validation errors appear', async () => {
          // Verify validation errors appear (without "length" in the message for numeric types)
          await expect(
            page.getByText('Minimum must be less than or equal to maximum.')
          ).toBeVisible();
          await expect(
            page.getByText('Maximum must be greater than or equal to minimum.')
          ).toBeVisible();
        });
      }
    );

    test(
      'should clear validation error when min/max values are corrected',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to survey tab', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
        });

        await test.step('Open create survey question form', async () => {
          await page.getByRole('link', { name: 'Create survey question', exact: true }).click();
        });

        await test.step('Fill required fields with invalid min/max', async () => {
          await page.getByTestId('question-name').fill('Test Question');
          await page.getByTestId('question-variable').fill('test_var');

          // Set invalid min/max (min > max)
          await page.getByTestId('question-min').fill('100');
          await page.getByTestId('question-max').fill('50');
          await page.getByTestId('question-name').click();
        });

        await test.step('Verify error appears', async () => {
          await expect(
            page.getByText('Minimum length must be less than or equal to maximum length.')
          ).toBeVisible();
        });

        await test.step('Fix by increasing max above min', async () => {
          await page.getByTestId('question-max').fill('200');
          await page.getByTestId('question-name').click();
        });

        await test.step('Verify error is gone', async () => {
          await expect(
            page.getByText('Minimum length must be less than or equal to maximum length.')
          ).not.toBeVisible();
          await expect(
            page.getByText('Maximum length must be greater than or equal to minimum length.')
          ).not.toBeVisible();
        });
      }
    );

    test(
      'should validate text answer by length not numeric value (01 is valid for length 2)',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to survey tab', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
        });

        await test.step('Open create survey question form', async () => {
          await page.getByRole('link', { name: 'Create survey question', exact: true }).click();
        });

        await test.step('Fill fields with min/max length of 2', async () => {
          await page.getByTestId('question-name').fill('Text Length Test');
          await page.getByTestId('question-variable').fill('text_length_var');

          // Set min and max length to 2
          await page.getByTestId('question-min').fill('2');
          await page.getByTestId('question-max').fill('2');

          // Enter "01" as default answer - this has length 2 and should be valid
          // even though numerically it might be interpreted as 1
          await page.getByTestId('question-default').fill('01');
          await page.getByTestId('question-name').click();
        });

        await test.step('Verify no validation errors', async () => {
          await expect(page.getByText(/must be less than/i)).not.toBeVisible();
          await expect(page.getByText(/must be greater/i)).not.toBeVisible();
          await expect(page.getByText(/cannot be greater than/i)).not.toBeVisible();
        });

        await test.step('Verify form is valid and create the survey', async () => {
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
        });

        await test.step('Verify question was created successfully', async () => {
          // Verify we're back on the survey tab with the created question
          await expect(page.getByTestId('row-0')).toBeVisible();
          await expect(page.getByText('Text Length Test', { exact: true })).toBeVisible();
          await expect(page.getByText('01', { exact: true })).toBeVisible();
        });
      }
    );
  });

  test.describe('WFJT Surveys: Launch WFJT with Survey Enabled', () => {
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

    let workflowJobTemplate: WorkflowJobTemplateType;
    test.beforeEach(async ({ page }) => {
      workflowJobTemplate = await WorkflowJobTemplate.api.create(page);
    });

    test.afterEach(async ({ page }) => {
      await WorkflowJobTemplate.api.delete(page, workflowJobTemplate.id).catch(() => {});
    });

    test(
      'should create survey with all question types via UI, enable survey, and verify launch functionality',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Create all survey question types via UI', async () => {
          await WorkflowJobTemplateSurvey.ui.navigateToSurveyTab(page, workflowJobTemplate.name);
          for (const surveyType of surveyTypes) {
            await WorkflowJobTemplateSurvey.ui.createQuestion(
              page,
              workflowJobTemplate.name,
              surveyType.question,
              true
            );
          }
        });

        await test.step('Verify all questions appear in survey list', async () => {
          await expect(page.getByRole('tab', { name: 'Survey' })).toHaveAttribute(
            'aria-selected',
            'true'
          );

          for (let i = 0; i < surveyTypes.length; i++) {
            const row = page.getByTestId(`row-${i}`);
            await expect(
              row
                .getByTestId('name-column-cell')
                .getByText(surveyTypes[i].question.question_name, { exact: true })
            ).toBeVisible();
          }
        });

        await test.step('Enable survey', async () => {
          const surveySwitch = page.getByTestId('survey-switch');
          const isChecked = await surveySwitch.isChecked();
          if (!isChecked) {
            const responsePromise = page.waitForResponse(
              (response) =>
                response.url().includes('/workflow_job_templates/') &&
                response.request().method() === 'PATCH' &&
                response.status() === 200
            );
            await surveySwitch.click({ force: true });
            await responsePromise;
          }
          await expect(surveySwitch).toBeChecked();
        });

        await test.step('Launch, verify all question types, and complete launch', async () => {
          // Launch the workflow template once
          await WorkflowJobTemplateSurvey.ui.launchWithPrompt(
            page,
            workflowJobTemplate.name,
            surveyTypes[0].question
          );

          // Verify all questions are present in the survey with correct defaults
          for (const surveyType of surveyTypes) {
            await test.step(`Verify ${surveyType.type} question is present`, async () => {
              // Verify question name is visible
              await expect(page.getByText(surveyType.question.question_name).first()).toBeVisible();

              const formGroup = page.getByTestId(`survey-${surveyType.type}-answer-form-group`);

              // Verify default values based on question type
              if (surveyType.type === 'multiselect') {
                const defaults = surveyType.question.default.toString().split('\n');
                for (const defaultValue of defaults) {
                  await expect(formGroup.getByText(defaultValue, { exact: true })).toBeVisible();
                }
              } else if (surveyType.type !== 'multiplechoice') {
                const answerField = page.getByLabel(surveyType.question.question_name);
                await expect(answerField).toHaveValue(surveyType.expectedDefaultValue);
              }
            });
          }

          // Complete the launch with all questions verified
          await WorkflowJobTemplateSurvey.ui.finishLaunch(page, surveyTypes[0].question);
        });
      }
    );
  });
});
