import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Inventory, JobTemplate, Organization, Project } from '@ansible/playwright/utils';
import { JobTemplateSurvey } from '@ansible/playwright/utils/templateSurvey';
import { expectPatternDescriptionVisible } from '@ansible/playwright/utils/optionsDrivenValidation';
import {
  findValueFailingPattern,
  requireSurveySpecNestedPatterns,
} from '@ansible/playwright/utils/surveySpecOptionsValidation';
import type { JobTemplate as JobTemplateType } from '@ansible/awx-ui/interfaces/JobTemplate';
import type { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import type { Project as ProjectType } from '@ansible/awx-ui/interfaces/Project';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Job template survey OPTIONS pattern validation', () => {
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
    'survey question editor shows pattern_description when nested spec OPTIONS patterns reject input',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const { questionName } = await requireSurveySpecNestedPatterns(
        page,
        jobTemplate.id,
        testInfo
      );

      const invalidValue = findValueFailingPattern(questionName.pattern!, questionName.flags);
      testInfo.skip(
        !invalidValue,
        'Could not derive a sample value that fails survey question_name pattern'
      );

      await JobTemplateSurvey.ui.navigateToSurveyTab(page, jobTemplate.name);
      await page.getByRole('link', { name: 'Create survey question', exact: true }).click();
      await page.getByTestId('question-name').fill(invalidValue!);
      await page.getByTestId('question-variable').fill('pattern_validation_var');
      await page.getByTestId('question-name').blur();

      await expectPatternDescriptionVisible(page, questionName.pattern_description!);
    }
  );

  test(
    'launch survey step shows pattern_description when nested spec OPTIONS patterns reject text answers',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const { launchText } = await requireSurveySpecNestedPatterns(page, jobTemplate.id, testInfo);

      const invalidValue = findValueFailingPattern(launchText.pattern!, launchText.flags);
      testInfo.skip(
        !invalidValue,
        'Could not derive a sample value that fails survey launch text pattern'
      );

      await JobTemplateSurvey.api.createQuestion(page, jobTemplate.name, {
        question_name: 'Pattern validation answer',
        question_description: 'Launch survey pattern test',
        variable: 'pattern_validation_answer',
        default: 'ok',
        type: 'text',
        required: true,
      });
      await JobTemplateSurvey.ui.enableSurvey(page, jobTemplate.name);

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
      await page.getByRole('button', { name: 'Survey' }).click();

      const answerInput = page.getByRole('textbox', { name: 'Pattern validation answer' });
      await expect(answerInput).toBeVisible({ timeout: 15000 });
      await answerInput.fill(invalidValue!);
      await answerInput.blur();

      await expectPatternDescriptionVisible(page, launchText.pattern_description!);
    }
  );
});
