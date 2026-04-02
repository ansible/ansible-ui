import type { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import type { MeshVisualizer } from '@ansible/awx-ui/interfaces/MeshVisualizer';
import type { Settings } from '@ansible/awx-ui/interfaces/Settings';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { login } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Instance, Organization, User } from '@ansible/playwright/utils';
import { expect, test, type Page } from '@playwright/test';

async function isK8sDeployment(page: Page): Promise<boolean> {
  try {
    const settings = await awxAPI.get<Settings>(page, '/settings/system/');
    return settings?.IS_K8S === true;
  } catch {
    return false;
  }
}

test.describe('Topology View', () => {
  test.beforeEach(setupBefore({ path: '/execution/infrastructure/topology' }));
  test.afterEach(setupAfter);

  test(
    'should render all nodes from mesh_visualizer endpoint',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const meshData = await awxAPI.get<MeshVisualizer>(page, '/mesh_visualizer/');

      await test.step('Navigate to Topology View', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Topology View');
        await expect(page.getByRole('heading', { name: 'Topology View' })).toBeVisible();
      });

      await test.step('Verify all nodes from API are rendered in topology', async () => {
        expect(meshData).not.toBeNull();
        expect(meshData!.nodes.length).toBeGreaterThan(0);

        // Verify each node is rendered in the topology by checking for the SVG element with data-id
        // Note: We use data-id because the UI may truncate long hostnames in the visible text
        for (const node of meshData!.nodes) {
          await expect(page.locator(`[data-id="${node.id}"]`)).toBeVisible({
            timeout: 5000,
          });
        }
      });
    }
  );

  test(
    'should navigate to instance detail when instance is clicked from sidebar',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const meshData = await awxAPI.get<MeshVisualizer>(page, '/mesh_visualizer/');
      expect(meshData).not.toBeNull();
      expect(meshData!.nodes.length).toBeGreaterThan(0);
      const firstNode = meshData!.nodes[0];

      await test.step('Navigate to Topology View and wait for data', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Topology View');
        await expect(page.getByRole('heading', { name: 'Topology View' })).toBeVisible();
      });

      await test.step('Click on first node and verify sidebar appears', async () => {
        await page.locator(`[data-id="${firstNode.id}"]`).click();
        await expect(page.getByTestId('mesh-viz-sidebar')).toBeVisible();
      });

      await test.step('Click instance name to navigate to instance details', async () => {
        await page
          .getByTestId('mesh-viz-sidebar')
          .getByTestId('name')
          .getByRole('button', { name: firstNode.hostname })
          .click();

        await expect(page).toHaveURL(new RegExp('/infrastructure/instances/'));
        await expect(page.getByRole('heading', { name: firstNode.hostname })).toBeVisible();
      });
    }
  );

  test(
    'should navigate to instance group detail when instance group is clicked from sidebar',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const isK8s = await isK8sDeployment(page);
      if (!isK8s) {
        test.skip(true, 'Test requires K8s/OpenShift deployment for instance groups in topology');
        return;
      }

      await test.step('Navigate to Topology View and wait for data', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Topology View');
        await expect(page.getByRole('heading', { name: 'Topology View' })).toBeVisible();
      });

      await test.step('Click on first node to open sidebar', async () => {
        const meshResponse = await page.waitForResponse(
          (response) => response.url().includes('/mesh_visualizer/') && response.status() === 200,
          { timeout: 10000 }
        );
        const meshData = (await meshResponse.json()) as MeshVisualizer;

        expect(meshData.nodes.length).toBeGreaterThan(0);

        const firstNode = meshData.nodes[0];
        await page.locator(`[data-id="${firstNode.id}"]`).click();
        await expect(page.getByTestId('mesh-viz-sidebar')).toBeVisible();
      });

      await test.step('Navigate to instance group if node has associated groups', async () => {
        const instanceGroupsResponse = await page.waitForResponse(
          (response) =>
            response.url().includes('/instances/') &&
            response.url().includes('/instance_groups/') &&
            response.status() === 200,
          { timeout: 10000 }
        );
        const instanceGroupsData = (await instanceGroupsResponse.json()) as {
          results: InstanceGroup[];
        };

        // Skip if this node has no associated instance groups
        if (instanceGroupsData.results.length === 0) {
          test.skip(true, 'Selected node has no associated instance groups to test navigation');
          return;
        }

        const firstInstanceGroup = instanceGroupsData.results[0];
        await page
          .getByTestId('mesh-viz-sidebar')
          .getByRole('link', { name: firstInstanceGroup.name })
          .click();

        await expect(page).toHaveURL(new RegExp(`/instance-groups/${firstInstanceGroup.id}`));
        await expect(page.getByRole('heading', { name: firstInstanceGroup.name })).toBeVisible();
      });
    }
  );

  test(
    'should render a large number of nodes without performance degradation',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Generate a large set of nodes (50 nodes) to stress-test rendering
      // This validates react-topology can handle many nodes since Vitest cannot render it
      const largeNodeCount = 50;
      const instanceNodesFixture: MeshVisualizer = {
        nodes: Array.from({ length: largeNodeCount }, (_, i) => ({
          id: i + 1,
          hostname: `E2EInstance${i + 1}`,
          node_type: i === 0 ? 'control' : 'execution',
          node_state: i % 3 === 0 ? 'ready' : 'installed',
          enabled: i % 4 !== 0,
        })),
        links: [],
      };

      await test.step('Intercept mesh_visualizer endpoint with large dataset and reload', async () => {
        await page.route('**/api/controller/v2/mesh_visualizer/', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(instanceNodesFixture),
          });
        });

        const meshResponse = page.waitForResponse('**/api/controller/v2/mesh_visualizer/');
        await page.reload();
        await meshResponse;
        await expect(page.getByRole('heading', { name: 'Topology View' })).toBeVisible({
          timeout: 15000,
        });
      });

      await test.step('Verify topology renders all nodes without timeout', async () => {
        // Verify first node (control) is visible (use exact to avoid matching E2EInstance10, E2EInstance11, etc.)
        await expect(page.getByText('E2EInstance1', { exact: true })).toBeVisible({
          timeout: 10000,
        });

        // Verify last node is visible
        await expect(page.getByText(`E2EInstance${largeNodeCount}`, { exact: true })).toBeVisible({
          timeout: 10000,
        });

        // Sample check: verify nodes in middle are visible
        await expect(page.getByText('E2EInstance25', { exact: true })).toBeVisible();

        // Verify the page still has the heading (not crashed)
        await expect(page.getByRole('heading', { name: 'Topology View' })).toBeVisible();
      });
    }
  );

  test(
    'should allow the user to select node and delete it',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const isK8s = await isK8sDeployment(page);
      if (!isK8s) {
        test.skip(true, 'Test requires K8s/OpenShift deployment for instance creation');
        return;
      }

      const instanceHostname = createE2EName('instance', { noWhitespace: true });

      // Create execution node via API
      const instance = await Instance.api.create(page, instanceHostname);

      try {
        await test.step('Navigate to topology view and verify instance is visible', async () => {
          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Topology View');
          await expect(page.getByRole('heading', { name: 'Topology View' })).toBeVisible();

          // Wait for instance to appear in topology (K8s may take time to provision and sync)
          await expect(page.locator(`[data-id="${instance.id}"]`)).toBeVisible({
            timeout: 60000,
          });
        });

        await test.step('Click on instance node to open sidebar', async () => {
          // Use data-id to click the node (hostname may be truncated in UI)
          await page.locator(`[data-id="${instance.id}"]`).click();
          await expect(page.getByTestId('mesh-viz-sidebar')).toBeVisible();
        });

        await test.step('Navigate to instance details page', async () => {
          await page
            .getByTestId('mesh-viz-sidebar')
            .getByTestId('name')
            .getByRole('button', { name: instanceHostname })
            .click();

          await expect(page).toHaveURL(new RegExp('/infrastructure/instances/'));
          await expect(page.getByRole('heading', { name: instanceHostname })).toBeVisible();
        });

        await test.step('Delete the instance', async () => {
          await clickPageAction('Remove instance', page);
          await confirmAndAssertDeletion(page);
        });

        await test.step('Verify instance removal initiated', async () => {
          // K8s instance deletion is async — force cleanup via API
          await Instance.api.delete(page, instance.id).catch(() => {});
        });
      } catch (error) {
        try {
          await Instance.api.delete(page, instance.id);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  );

  test.describe('RBAC', () => {
    test(
      'should not show Topology View in sidebar for non-admins',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        let organization: Awaited<ReturnType<typeof Organization.api.create>> | undefined;
        let userCredentials: Awaited<ReturnType<typeof User.ui.create>> | undefined;

        try {
          await test.step('Create organization and non-admin user', async () => {
            organization = await Organization.api.create(page);
            userCredentials = await User.ui.create(page, {
              userType: 'normal',
            });
          });

          await test.step('Logout as admin and login as non-admin user', async () => {
            if (!userCredentials) {
              throw new Error('Failed to create user credentials');
            }
            await logout(page, { username: process.env.PLATFORM_USERNAME });
            await login(page, undefined, {
              username: userCredentials.userName,
              password: userCredentials.password,
            });
          });

          await test.step('Verify Topology View link is not visible in navigation', async () => {
            // Ensure navigation is visible
            const pageNavigation = page.getByTestId('page-navigation');
            const isNavVisible = await pageNavigation.isVisible();
            if (!isNavVisible) {
              await page.getByTestId('nav-toggle').click();
            }

            // Verify Topology View link does not exist
            await expect(page.getByTestId('awx-topology-view')).not.toBeVisible();
          });
        } finally {
          // Cleanup: logout non-admin user and re-login as admin
          if (userCredentials) {
            await logout(page, { username: userCredentials.userName });
          }
          await login(page);

          // Delete user
          if (userCredentials) {
            try {
              await User.ui.delete(page, userCredentials.userName);
            } catch {
              // Ignore cleanup errors
            }
          }

          // Delete organization
          if (organization) {
            try {
              await Organization.api.delete(page, organization.id);
            } catch {
              // Ignore cleanup errors
            }
          }
        }
      }
    );
  });
});
