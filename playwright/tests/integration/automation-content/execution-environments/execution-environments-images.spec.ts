import { expect, test } from '@playwright/test';
import { hubAPI } from '@ansible/playwright/commands/apiClient';
import { formatBytes, sumLayers } from '@ansible/playwright/commands/formatters';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

interface HubItemsResponse<T> {
  data: T[];
  meta: {
    count: number;
  };
}

interface ExecutionEnvironmentImage {
  digest: string;
  tags: string[];
  updated_at: string;
  layers: Array<{ size: number }>;
}

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environment - Images Tab', () => {
  test(
    'should display images tab for existing execution environment with metadata verification',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      let executionEnvironmentName: string | undefined;

      await test.step('Navigate to execution environments and find one with images', async () => {
        await navigateTo(page, 'Automation Content', 'Execution Environments');
        await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

        const rows = page.getByRole('row');
        const rowCount = await rows.count();

        if (rowCount <= 1) {
          test.skip(true, 'No execution environments found on this deployment');
        }

        const firstEELink = rows.nth(1).getByRole('link').first();
        executionEnvironmentName = (await firstEELink.textContent()) ?? undefined;
        await firstEELink.click();
      });

      await test.step('Navigate to images tab', async () => {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        await page.getByTestId('execution-environment-images-tab').click();
      });

      await test.step('Verify images tab shows at least one image', async () => {
        await page.waitForResponse(
          (response) => response.url().includes('/_content/images/') && response.status() === 200,
          { timeout: 15000 }
        );

        const rows = page.getByRole('row');
        const rowCount = await rows.count();

        if (rowCount <= 1) {
          test.skip(true, 'No images found for this execution environment');
        }
      });

      await test.step('Test copy to clipboard functionality', async () => {
        const copyButton = page.getByRole('button', { name: 'Copy to clipboard' }).first();
        await copyButton.click();

        await expect(page.getByTestId('alert-toaster')).toBeVisible();

        await page.getByTestId('alert-toaster').getByRole('button').click();
      });

      await test.step('Verify image details from API data', async () => {
        const imageData = await hubAPI.get<HubItemsResponse<ExecutionEnvironmentImage>>(
          page,
          `v3/plugin/execution-environments/repositories/${executionEnvironmentName}/_content/images/?exclude_child_manifests=true&offset=0&limit=10`
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

        // Verify published date
        const createdDate = new Date(updated_at);
        const formattedDateTime = `${createdDate.toLocaleDateString()}, ${createdDate.toLocaleTimeString()}`;
        const publishedCell = page.getByTestId('published-column-cell').first();
        await expect(publishedCell).toContainText(formattedDateTime);

        // Verify layer count
        const layersCell = page.getByTestId('layers-column-cell').first();
        const layerCountText = await layersCell.innerText();
        expect(layerCountText.trim()).toBe(layers.length.toString());

        // Verify size
        const sizeCell = page.getByTestId('size-column-cell').first();
        const totalSize = sumLayers(layers);
        const formattedSize = formatBytes(totalSize);
        const sizeText = await sizeCell.innerText();
        expect(sizeText.trim()).toBe(formattedSize);

        // Verify digest link
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
