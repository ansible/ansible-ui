/* eslint-disable no-console */
import { Page, test } from '@playwright/test';
import { klona } from 'klona/json';
import { platformUI } from '../commands/login';
import { controllerDashboardJobs } from './controller/controllerDashboardJobs';
import { getJobEvents, getJobEventsChildrenSummary } from './controller/controllerJobs';
import {
  getJobTemplateLaunch,
  postJobTemplateLaunch,
  processJobTemplate,
} from './controller/controllerJobTemplates';
import { processProject } from './controller/controllerProcessProject';
import { getProjectPlaybooks } from './controller/controllerProjectPlaybooks';
import { controllerRelations } from './controller/controllerRelations';
import { getUnifiedTemplates } from './controller/controllerUnifiedTemplates';
import { gatewayRelations } from './gateway/gatewayRelations';
import { authenticatedGuard } from './handlers/authenticatedGuard';
import { deleteItem } from './handlers/deleteItem';
import { gatewayApiRoute } from './handlers/gatewayApiRoute';
import { getData } from './handlers/getData';
import { getItem } from './handlers/getItem';
import { getItemOptions } from './handlers/getItemOptions';
import { getItems } from './handlers/getItems';
import { getOptions } from './handlers/getOptions';
import { handleRoute } from './handlers/handleRoute';
import { postGatewayLogin } from './handlers/postGatewayLogin';
import { postItem } from './handlers/postItem';
import { mockData } from './mockData';
import { mockOptions } from './mockOptions';
import { logApiCallResponse } from './router/logApiCallResponse';
import { Router } from './router/Router';

/** Mocks the API calls for the tests. */
export async function mock(page: Page) {
  const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;
  if (!mockEnabled) {
    page.mock = { enabled: false };
    return; // Only mocks the API calls if the `mock` is set to `true`.
  }

  // Each test run gets a new copy of the mock data
  const dataCopy = klona(mockData);
  const optionsCopy = klona(mockOptions);

  // Router - Stack of routes - Stops at first matching route that returns a response
  const router = new Router()
    .GET('/api', gatewayApiRoute)
    .GET('/api/gateway/v1/login', () => ({ status: 200 }))
    .POST('/api/gateway/v1/login', postGatewayLogin)
    .GET('/api/gateway/v1/ui_auth', getData())
    .GET('/api/gateway/v1/legacy_auth', getData())
    .GET('/api/gateway/v1/ping', () => ({ status: 200 }))
    .GET('/api/galaxy/_ui/v1/settings', getData())
    .GET('/api/controller/v2/auth', getData())

    // --- Only routes before this can be accessed unauthenticated ---
    .GET('/api/*subpath', authenticatedGuard)

    // Gateway API
    .GET('/api/gateway/v1/session', () => ({ status: 200 }))

    // Gateway Resource API
    .OPTIONS('/api/gateway/v1/:resource', getOptions())
    .GET('/api/gateway/v1/:resource', getItems(gatewayRelations))
    .POST('/api/gateway/v1/:resource', postItem({ relations: gatewayRelations }))
    .OPTIONS('/api/gateway/v1/:resource/:id', getItemOptions())
    .GET('/api/gateway/v1/:resource/:id', getItem(gatewayRelations))
    .DELETE('/api/gateway/v1/:resource/:id', deleteItem())

    // Controller API
    .GET('/api/controller/v2/config', getData())
    .GET('/api/controller/v2/dashboard', getData())
    .GET('/api/controller/v2/dashboard/graphs/jobs', controllerDashboardJobs)

    // Special handling
    .POST(
      '/api/controller/v2/projects',
      postItem({ relations: controllerRelations, process: processProject })
    )
    .GET('/api/controller/v2/projects/:id/playbooks', getProjectPlaybooks)
    .GET('/api/controller/v2/unified_job_templates', getUnifiedTemplates)
    .POST(
      '/api/controller/v2/job_templates',
      postItem({ relations: controllerRelations, process: processJobTemplate })
    )
    .GET('/api/controller/v2/job_templates/:id/launch', getJobTemplateLaunch)
    .POST('/api/controller/v2/job_templates/:id/launch', postJobTemplateLaunch)
    .GET('/api/controller/v2/jobs/:id/job_events/children_summary', getJobEventsChildrenSummary)
    .GET('/api/controller/v2/jobs/:id/job_events', getJobEvents)
    // .GET('/api/controller/v2/workflow_jobs/:id/workflow_nodes', TODO)

    // Controller Resource API
    .OPTIONS('/api/controller/v2/:resource', getOptions())
    .GET('/api/controller/v2/:resource', getItems(controllerRelations))
    .POST('/api/controller/v2/:resource', postItem({ relations: controllerRelations }))
    .OPTIONS('/api/controller/v2/:resource/:id', getItemOptions())
    .GET('/api/controller/v2/:resource/:id', getItem(controllerRelations))
    .DELETE('/api/controller/v2/:resource/:id', deleteItem());

  // Handle Router
  await page
    .context()
    .route(`${platformUI}/api/**/*`, (route) => handleRoute(route, router, dataCopy, optionsCopy));

  page.mock = {
    enabled: true,
    data: dataCopy,
    options: optionsCopy,
    router,
  };

  // Log API Calls
  page.on('response', logApiCallResponse);
}
