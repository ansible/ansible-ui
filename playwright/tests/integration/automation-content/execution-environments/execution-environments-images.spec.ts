import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { formatBytes, sumLayers } from '@ansible/playwright/commands/formatters';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { HubExecutionEnvironment } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environment - Images Tab', () => {
  test(
    'should display images tab for existing execution environment with metadata verification',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      let executionEnvironmentName!: string;

      await test.step('Find an execution environment with images via API', async () => {
        const eeList = await HubExecutionEnvironment.api.list(page, { limit: 10 });

        if (!eeList?.data?.length) {
          test.skip(true, 'No execution environments found on this deployment');
          return;
        }

        let foundEEWithImages: string | undefined;

        for (const ee of eeList.data) {
          const imageData = await HubExecutionEnvironment.api.listImages(page, ee.name, {
            limit: 1,
          });
          if (imageData?.data?.length) {
            foundEEWithImages = ee.name;
            break;
          }
        }

        if (!foundEEWithImages) {
          test.skip(true, 'No execution environments with images found');
          return;
        }

        executionEnvironmentName = foundEEWithImages;
      });

      await test.step('Navigate to execution environment details', async () => {
        await navigateTo(page, 'Automation Content', 'Execution Environments');
        await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

        await clickTableRow({ filterLabel: 'Name', text: executionEnvironmentName }, page);
      });

      await test.step('Navigate to images tab', async () => {
        await page.getByTestId('execution-environment-images-tab').click();

        await page.waitForResponse(
          (response) => response.url().includes('/_content/images/') && response.status() === 200,
          { timeout: 15000 }
        );

        await expect(page.locator('tbody')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Test copy to clipboard functionality', async () => {
        const copyButton = page.getByRole('button', { name: 'Copy to clipboard' }).first();
        await copyButton.click();

        await expect(page.getByTestId('alert-toaster')).toBeVisible();

        await page.getByTestId('alert-toaster').getByRole('button').click();
      });

      await test.step('Verify image details from API data', async () => {
        const imageData = await HubExecutionEnvironment.api.listImages(
          page,
          executionEnvironmentName
        );

        expect(imageData).toBeTruthy();
        expect(imageData!.data.length).toBeGreaterThan(0);

        const image = imageData!.data[0];
        const { updated_at, tags, layers, digest } = image;

        if (tags.length > 0) {
          const tagCell = page.getByTestId('tag-column-cell').first();
          for (const tag of tags) {
            await expect(tagCell.locator('li').filter({ hasText: tag })).toBeVisible();
          }
        }

        const createdDate = new Date(updated_at);
        const formattedDateTime = `${createdDate.toLocaleDateString()}, ${createdDate.toLocaleTimeString()}`;
        const publishedCell = page.getByTestId('published-column-cell').first();
        await expect(publishedCell).toContainText(formattedDateTime);

        const layersCell = page.getByTestId('layers-column-cell').first();
        const layerCountText = await layersCell.innerText();
        expect(layerCountText.trim()).toBe(layers.length.toString());

        const sizeCell = page.getByTestId('size-column-cell').first();
        const totalSize = sumLayers(layers);
        const formattedSize = formatBytes(totalSize);
        const sizeText = await sizeCell.innerText();
        expect(sizeText.trim()).toBe(formattedSize);

        const digestCell = page.getByTestId('digest-column-cell').first();
        const digestLink = digestCell.getByRole('link');

        const href = await digestLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(decodeURIComponent(href!)).toContain(
          `/execution-environments/${executionEnvironmentName}/images/${digest}/`
        );

        const digestLabelText = await digestLink.locator('span.pf-v6-c-label__text').innerText();
        const truncatedDigest = digest.substring(0, 12);
        expect(digestLabelText.trim()).toMatch(new RegExp(`^${truncatedDigest}`));
      });
    }
  );
});
