import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

function buildJobsGraphResponse() {
  const lastDayStart = new Date();
  lastDayStart.setHours(12, 0, 0, 0);
  const lastDay = Math.floor(lastDayStart.getTime() / 1000);
  const previousDay = lastDay - 86_400;

  return {
    jobs: {
      successful: [
        [previousDay, 10],
        [lastDay, 11_031],
      ],
      failed: [
        [previousDay, 2],
        [lastDay, 65],
      ],
      canceled: [[lastDay, 0]],
      error: [[lastDay, 540]],
    },
  };
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/dashboard/graphs/jobs/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildJobsGraphResponse()),
    });
  });
  await setupBefore({ path: '/overview' })({ page });
});

test.afterEach(setupAfter);

test('should keep the last job activity chart day inside the plot area', async ({ page }) => {
  if (!(await page.locator('#platform-awx').isVisible())) {
    await expect(page.locator('#job-activity')).not.toBeVisible();
    return;
  }

  const jobActivityChart = page.locator('#job-activity .page-chart');
  await expect(jobActivityChart).toBeVisible({ timeout: 60_000 });

  const trailingInset = await jobActivityChart.evaluate((chart: Element): number | null => {
    const svg = chart.querySelector('svg');
    if (!(svg instanceof SVGSVGElement)) {
      return null;
    }
    const chartBox = svg.getBoundingClientRect();
    const dateTicks: SVGTextElement[] = [];
    svg.querySelectorAll('text').forEach((node) => {
      if (node instanceof SVGTextElement && /^\d+\/\d+$/.test(node.textContent?.trim() ?? '')) {
        dateTicks.push(node);
      }
    });
    if (dateTicks.length === 0) {
      return null;
    }
    const rightmostTick = dateTicks.reduce((rightmost, tick) =>
      tick.getBoundingClientRect().right > rightmost.getBoundingClientRect().right
        ? tick
        : rightmost
    );
    return chartBox.right - rightmostTick.getBoundingClientRect().right;
  });

  expect(trailingInset).not.toBeNull();
  expect(trailingInset!).toBeGreaterThan(4);
});
