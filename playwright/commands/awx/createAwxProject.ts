import { expect, Page } from '@playwright/test';
import { createE2EName } from '../createE2EName';

export async function createAwxProject(
  page: Page,
  options: {
    projectName?: string;
    organizationName: string;
  }
) {
  const projectName = options.projectName ?? createE2EName();
  const organizationName = options.organizationName;

  await page.getByRole('link', { name: 'Projects', exact: true }).click();

  await page.getByRole('link', { name: 'Create project' }).click();

  await page.getByLabel('Name').fill(projectName);

  await page.getByLabel('Organization *').click();
  await page.getByLabel('Search input').fill(organizationName);
  await page.getByRole('option', { name: organizationName }).click();

  await page.getByLabel('Choose a Source Control Type').click();
  await page.getByRole('option', { name: 'Git' }).click();

  await page.getByLabel('Source Control URL').fill('https://www.example.com');

  await page.getByRole('button', { name: 'Create project' }).click();

  await expect(page.getByRole('heading')).toContainText(projectName);

  return projectName;
}
