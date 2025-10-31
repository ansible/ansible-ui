import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { APIRequestContext, Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { platformUI } from '@ansible/playwright/commands/login';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { controllerAPI } from './controller-api';
interface WFVizMock {
  mockData: PlatformItemsResponse<unknown> /** Object response from API */;
  id: number /** ID of the Workflow Job Template */;
  page: Page /** Page Context from Playwright */;
}
interface WFVizLink {
  sourceId: number /** ID of the first node */;
  targetId: number /** ID of the second node */;
  type: LinkType;
  request: APIRequestContext;
}

type LinkType = 'always' | 'success' | 'failure';
/**
 * @description This helper function uses an API request to link 2 nodes together.
 * @param options
 * @interface WFVizLink
 * {
 *  sourceId: number /** ID of the first node
 *  targetId: number /** ID of the second node
 *  type: LinkType;
 *  request: APIRequestContext;
 *  }
 * @returns a link between sourceId (id of the source node) and targetId (id of the target node)
 */
export const createWFVizLink = async (options: WFVizLink) => {
  const postWFVizLink = async () => {
    const url =
      platformUI +
      controllerAPI(
        `/workflow_job_template_nodes/${options.sourceId.toString()}/${options.type}_nodes/`
      );
    const cookie = (await options.request.storageState()).cookies.find(
      (cookie) => cookie.name === 'csrftoken'
    );
    await options.request.post(url, {
      data: {
        id: options.targetId,
      },
      headers: {
        'X-CSRFToken': cookie?.value as string,
      },
    });
  };
  return await postWFVizLink();
};

/**
 * @description This helper function creates a WFJT and returns its name upon creation
 * @returns the name of created Workflow Job Template
 * @param page
 * @param options Optional parameters for workflow job template creation
 */
export async function createWorkflowJobTemplate(
  page: Page,
  options?: { inventoryName?: string; organizationName?: string }
) {
  const name = 'Workflow job template' + createE2EName();
  await navigateTo(page, 'Automation Execution', 'Templates');

  // Navigate directly to create page
  const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;
  await page.goto(`${platformUIWithoutSlash}/execution/templates/workflow-job-template/create`);

  // Fill in name (required field)
  await page.getByTestId('name').fill(name);

  // Fill in optional fields
  if (options?.organizationName) {
    await page.getByLabel('Organization').click();
    await page.getByLabel('Search input').fill(options.organizationName);
    await page.getByRole('option', { name: options.organizationName }).click();
  }

  if (options?.inventoryName) {
    await page.getByLabel('Inventory').click();
    await page.getByLabel('Search input').fill(options.inventoryName);
    await page.getByRole('option', { name: options.inventoryName }).click();
  }

  // Submit form
  await page.getByTestId('Submit').click();

  // Verify we're on the visualizer page
  await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();
  return name;
}

export async function deleteWorkflowJobTemplate(wfjtName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await clickTableRow({ text: wfjtName, clearFilters: true }, page);
  await clickPageAction('Delete template', page);
  await confirmAndAssertDeletion(page);
}

/**
 * @description This helper function deletes a workflow approval using the name of the workflow approval
 * passed as a string.
 * @param approvalName - Name given to the approval node
 * @param page
 */
export async function deleteWorkflowApproval(approvalName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Administration', 'Workflow Approvals');
  await clickTableRow({ text: approvalName }, page);
  await clickPageAction('Delete template', page);
  await confirmAndAssertDeletion(page);
  await expect(
    page.getByRole('heading', { name: 'Workflow Approvals', exact: true })
  ).toBeVisible();
}

/**
 * @description This helper function navigates to the visualizer of a specific WFJT.
 * @param wfjtName Pass the name of the specific WFJT as a string.
 * @param page
 */
export async function navigateToVisualizer(wfjtName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByRole('button', { name: 'table view' }).click();
  await clickTableRow({ filterLabel: 'Name', text: wfjtName }, page);
  await page.getByRole('link', { name: 'View workflow visualizer' }).click();
}

/**
 * @description This helper function creates a step (aka node) in a workflow visualizer. This function
 * utilizes the createNode helper function.
 * @param stepType - Job Template, Workflow Job Template, Project Sync, Inventory Source Sync,
 * Management Job, Approval
 * @param page
 * @param stepResourceName name of the resource associated with the step to be created
 */
export async function createVisualizerStep(
  stepType: string,
  stepResourceName: string,
  page: Page
): Promise<void> {
  switch (stepType) {
    case 'Job Template': {
      // const jt = await createJobTemplate({}, page);
      await createNode(stepType, page, stepResourceName, 'Job template');
      return;
    }
    case 'Workflow Job Template': {
      // const wfjt = await createWorkflowJobTemplate(page);
      await createNode(stepType, page, stepResourceName, 'Workflow job template');
      return;
    }
    case 'Project Sync': {
      // const project = await createAwxProject({}, page);
      await createNode(stepType, page, stepResourceName, 'Project');
      return;
    }
    case 'Inventory Source Sync': {
      // const { inventoryName, inventorySourceName } = await createInventorySource({}, page);
      await createNode(stepType, page, stepResourceName, 'Inventory source');
      return;
    }
    case 'Management Job':
      await createNode(stepType, page, 'Clean up activity stream', 'Management job template');
      return;
    case 'Approval': {
      const wfApprovalName = 'Workflow Approval' + createE2EName();
      await createNode(stepType, page, wfApprovalName, '');
      return;
    }
    default:
      return;
  }
}

/**
 * @description This helper function creates a node inside a workflow visualizer that can be used to create
 * the step in the createVisualizerStep helper function. Requires an empty visualizer, because
 * it creates 1 node and then asserts that 1 node is visible.
 * Assumes user is already on the visualizer of the particular WFJT.
 * @param stepType - Job Template, Workflow Job Template, Project Sync, Inventory Source Sync,
 * Management Job, Approval
 * @param page - Playwright Page
 * @param resourceName - Name of the resource associated with the stepType
 * @param resourceSelectInputLabel - Label of the field in which the resourceName is selected
 */
async function createNode(
  stepType: string,
  page: Page,
  stepResourceName: string,
  resourceSelectInputLabel: string
) {
  await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: 'Add step' }).nth(1).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Job Template', exact: true }).click();
  await page.getByRole('option', { name: `${stepType}`, exact: true }).click();
  await page.getByLabel(`${resourceSelectInputLabel} *`).click();
  if (stepType === 'Approval') {
    await page.getByLabel('Name').fill(stepResourceName);
  } else {
    await page.getByLabel('Search input').fill(stepResourceName);
    await page.getByRole('option', { name: `${stepResourceName}` }).click();
  }
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Fit to Screen' }).click();
  await page.getByRole('button', { name: 'Legend' }).click();
  await page.getByRole('button', { name: 'Legend' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Success alert:Successfully')).toBeVisible();
  await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
}

/**
 * @description Using the UI, this helper function removes all the nodes on a particular workflow visualizer.
 * Must provide the name of the associated WFJT as a string. Assumes the test has already
 * navigated to the visualizer of an existing WFJT.
 * @param page
 */
export async function removeAllWorkflowVizNodes(page: Page) {
  await page
    .locator(
      'div:nth-child(2) > .pf-v6-c-toolbar__content-section > .pf-v6-c-toolbar__group > div:nth-child(4) > .pf-v6-c-menu-toggle'
    )
    .click();
  await page.getByRole('menuitem', { name: 'Remove all steps' }).click();
  await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Success alert:Successfully')).toBeVisible();
  await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
  await expect(
    page.getByRole('heading', { name: 'There are currently no nodes in this workflow' })
  ).toBeVisible();
}

/**
 * @description Renders a workflow visualizer with mock data
 * @param options
 * @interface WFVizMock
 * {
 *  mockData: PlatformItemsResponse<unknown> /** Items response object from the API
 *  id: number /** ID of the workflow job template
 *  page: Page context from Playwright;
 *  }
 */
export async function renderWFVizWithMockData(options: WFVizMock) {
  const url =
    platformUI + controllerAPI(`workflow-job-template/${options.id.toString()}/visualizer`);
  // Make sure we are on the visualizer page before mocking
  if (await options.page.request.get(url)) {
    await options.page.route(
      platformUI +
        controllerAPI(`/workflow_job_templates/${options.id.toString()}/workflow_nodes/*`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(options.mockData),
        });
      }
    );
  }
}
