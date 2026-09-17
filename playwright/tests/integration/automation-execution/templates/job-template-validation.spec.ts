import { expect, test } from '@playwright/test';
import { fillMonacoEditor } from '../../../../commands/fillMonacoEditor';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { Credential, Inventory } from '@ansible/playwright/utils';

test.describe('Job Template Form - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
  });

  test.afterEach(async ({ page }) => {
    await setupAfter({ page });
  });

  test(
    'cannot create a job template with more than one machine credential',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      const inventoryName = await Inventory.ui.create(page);
      const machineCredential1 = await Credential.ui.create(page, { credentialType: 'Machine' });
      const machineCredential2 = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();

      await page.getByPlaceholder('Enter job template name').fill('Test Job Template');
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
      await page.getByRole('option', { name: inventoryName, exact: true }).click();

      const projectName = 'Demo Project';
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();

      // Verify playbook was auto-selected since Demo Project has only one playbook
      await expect(page.getByTestId('playbook-form-group').locator('input')).toHaveValue(
        'hello_world.yml'
      );

      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(machineCredential1);
      await page.getByRole('checkbox', { name: `${machineCredential1} | Machine` }).check();
      await page.getByRole('textbox', { name: 'Search input' }).fill(machineCredential2);
      await page.getByRole('checkbox', { name: `${machineCredential2} | Machine` }).check();

      // Try to submit the form - validation error should prevent submission
      await page.getByRole('button', { name: 'Create job template' }).click();

      // Validation error should appear specifically under the credential field, not as a generic form error
      const credentialFormGroup = page.getByTestId('credential-form-group');
      await expect(credentialFormGroup).toBeVisible();
      await expect(
        credentialFormGroup.getByText(
          'Cannot assign multiple credentials of the same type. Duplicated credential types are: Machine'
        )
      ).toBeVisible({ timeout: 10000 });

      await Credential.ui.delete(page, machineCredential1);
      await Credential.ui.delete(page, machineCredential2);
      await Inventory.ui.delete(page, inventoryName);
    }
  );

  test(
    'cannot create a job template with more than one vault credential with same vault_id',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      const inventoryName = await Inventory.ui.create(page);
      const vaultCredential1 = await Credential.ui.create(page, {
        credentialType: 'Vault',
        vaultId: 'test-vault-1',
      });
      const vaultCredential2 = await Credential.ui.create(page, {
        credentialType: 'Vault',
        vaultId: 'test-vault-1',
      });

      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();

      await page.getByPlaceholder('Enter job template name').fill('Test Job Template');
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
      await page.getByRole('option', { name: inventoryName, exact: true }).click();

      const projectName = 'Demo Project';
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();

      // Verify playbook was auto-selected since Demo Project has only one playbook
      await expect(page.getByTestId('playbook-form-group').locator('input')).toHaveValue(
        'hello_world.yml'
      );

      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(vaultCredential1);
      await page.getByRole('checkbox', { name: `${vaultCredential1} | Vault` }).check();
      await page.getByRole('textbox', { name: 'Search input' }).fill(vaultCredential2);
      await page.getByRole('checkbox', { name: `${vaultCredential2} | Vault` }).check();

      // Try to submit the form - validation error should prevent submission
      await page.getByRole('button', { name: 'Create job template' }).click();

      // Validation error should appear specifically under the credential field, not as a generic form error
      const credentialFormGroup = page.getByTestId('credential-form-group');
      await expect(credentialFormGroup).toBeVisible();
      await expect(
        credentialFormGroup.getByText(
          'Cannot assign multiple vault credentials of the same vault id.'
        )
      ).toBeVisible({ timeout: 10000 });

      await Credential.ui.delete(page, vaultCredential1);
      await Credential.ui.delete(page, vaultCredential2);
      await Inventory.ui.delete(page, inventoryName);
    }
  );

  test(
    'should not grow content for invalid YAML in Extra Variables (AAP-93178)',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      // Regression test for AAP-93178: YAML/JSON fields crashed the browser when
      // given certain inputs (e.g. indented `---`).
      //
      // Root cause: valueToObject() returned the raw string when both JSON and
      // YAML parsing failed.  objectToString() then called jsyaml.dump(string),
      // which serialised it as a YAML block scalar (`|2-\n    ---\n    a: b\n`).
      // On the next watchValue cycle the block scalar loaded back with one extra
      // level of indentation, so each render added 2 characters indefinitely
      // until the tab exhausted memory and crashed.
      //
      // After the fix: valueToObject() throws on parse failure, handleChange()
      // catches it and calls setError() without updating the form value, so the
      // growth loop never starts.
      test.setTimeout(60 * 1000);

      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();

      await expect(page.getByRole('heading', { name: 'Create Job Template' })).toBeVisible();

      // Paste invalid indented YAML into the Extra Variables Monaco editor.
      // Leading spaces before `---` are a common artifact of copy-pasting from
      // code blocks and are rejected by js-yaml.
      const editorTextbox = page
        .getByTestId('extra-vars')
        .getByRole('textbox', { name: 'Editor content' });
      await fillMonacoEditor(page, '  ---\n  a: b', editorTextbox);

      // Blur the editor to trigger the watchValue update cycle.
      await page.getByPlaceholder('Enter job template name').click();

      // The editor must NOT show the YAML block scalar prefix `|2-`.
      // That prefix was the signature of the growing-content bug — each
      // parse → dump cycle produced `|2-\n    ---\n    a: b\n` with one more
      // level of indentation, eventually crashing the tab.
      // After the fix the editor reverts to its default (empty) value on blur.
      const editorLines = page.getByTestId('extra-vars').locator('.view-lines');
      await expect(editorLines).not.toContainText('|2-', { timeout: 3000 });

      // Page must still be functional — not crashed or frozen.
      await expect(page.getByRole('heading', { name: 'Create Job Template' })).toBeVisible();
    }
  );
});
