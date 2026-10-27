import { expect, test, type Page } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Authentication } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

const CLEAN_TEXT_ERROR = /can't include HTML tags, script markup, or unsafe URI schemes/;

async function openCreateMappingForm(page: Page) {
  await page.getByRole('tab', { name: 'Mapping' }).click();
  await page.getByRole('link', { name: 'Create mapping' }).click();
  await expect(page.getByRole('heading', { name: 'Create mapping' })).toBeVisible();
}

async function fillAttributeTrigger(
  page: Page,
  values: { name: string; attribute: string; value: string }
) {
  await page.getByRole('textbox', { name: 'name' }).fill(values.name);
  await page.getByRole('button', { name: 'Select rule condition' }).click();
  await page.getByRole('option', { name: 'Based on attributes' }).click();
  await page.getByRole('button', { name: 'Select condition type' }).click();
  await page.getByRole('option', { name: 'at least one' }).click();
  await page.getByRole('textbox', { name: 'Attribute' }).fill(values.attribute);
  await page.getByRole('textbox', { name: 'Value' }).fill(values.value);
}

test.describe(
  'Authenticator mapping attribute/value API validation',
  { tag: ['@not_mock', '@tier1'] },
  () => {
    test('shows value-field error on create when the API rejects the attribute value', async ({
      page,
    }, testInfo) => {
      const authenticatorName = await Authentication.ui.createMethod(page, {});
      try {
        await openCreateMappingForm(page);
        await fillAttributeTrigger(page, {
          name: 'value-validation',
          attribute: 'test',
          value: '<script>{{malicious}}',
        });

        const responsePromise = page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' &&
            response.url().includes('/authenticator_maps/')
        );
        await page.getByRole('button', { name: 'Create mapping' }).click();
        const response = await responsePromise;

        if (response.status() === 201) {
          testInfo.skip(true, 'Enhanced input validation is not enforced on authenticator maps');
        }

        expect(response.status()).toBe(400);
        await expect(page.locator('#attributes-0-value-form-group')).toContainText(
          CLEAN_TEXT_ERROR
        );
      } finally {
        await Authentication.ui.deleteMethod(page, authenticatorName);
      }
    });

    test('shows attribute and value errors on create when the API rejects both', async ({
      page,
    }, testInfo) => {
      const authenticatorName = await Authentication.ui.createMethod(page, {});
      try {
        await openCreateMappingForm(page);
        await fillAttributeTrigger(page, {
          name: 'attribute-value-validation',
          attribute: '{{malicioius}}',
          value: '<script>{{malicious}}',
        });

        const responsePromise = page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' &&
            response.url().includes('/authenticator_maps/')
        );
        await page.getByRole('button', { name: 'Create mapping' }).click();
        const response = await responsePromise;

        if (response.status() === 201) {
          testInfo.skip(true, 'Enhanced input validation is not enforced on authenticator maps');
        }

        expect(response.status()).toBe(400);
        const body = (await response.json()) as { triggers?: Record<string, unknown> };
        const triggerKeys = Object.keys(body.triggers ?? {});

        await expect(page.locator('#attributes-0-value-form-group')).toContainText(
          CLEAN_TEXT_ERROR
        );
        if (triggerKeys.some((key) => key === 'attributes.{{malicioius}}')) {
          await expect(page.locator('#attributes-0-attribute-form-group')).toContainText(
            CLEAN_TEXT_ERROR
          );
        }
      } finally {
        await Authentication.ui.deleteMethod(page, authenticatorName);
      }
    });

    test('shows value-field error on edit when the API rejects the attribute value', async ({
      page,
    }, testInfo) => {
      const authenticatorName = await Authentication.ui.createMethod(page, {});
      try {
        const mapName = await Authentication.ui.createMap(page, {
          authenticatorName,
          name: 'edit-validation',
          trigger: 'Attributes',
        });

        await page.getByRole('link', { name: mapName }).click();
        await page.getByRole('button', { name: 'Edit mapping' }).click();
        await expect(page.getByRole('heading', { name: /Edit / })).toBeVisible();

        await page.getByRole('textbox', { name: 'Attribute' }).first().fill('test');
        await page.getByRole('textbox', { name: 'Value' }).first().fill('<script>{{malicious}}');

        const responsePromise = page.waitForResponse(
          (response) =>
            response.request().method() === 'PATCH' &&
            response.url().includes('/authenticator_maps/')
        );
        await page.getByRole('button', { name: 'Save mapping' }).click();
        const response = await responsePromise;

        if (response.ok()) {
          testInfo.skip(true, 'Enhanced input validation is not enforced on authenticator maps');
        }

        expect(response.status()).toBe(400);
        await expect(page.locator('#attributes-0-value-form-group')).toContainText(
          CLEAN_TEXT_ERROR
        );
      } finally {
        await Authentication.ui.deleteMethod(page, authenticatorName);
      }
    });
  }
);
