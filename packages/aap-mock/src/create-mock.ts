import { mockContext, MockContext } from './context/context';
import { controllerDashboardJobs } from './controller/controllerDashboardJobs';
import { getJobEvents, getJobEventsChildrenSummary } from './controller/controllerJobs';
import {
  getJobTemplateLaunch,
  postJobTemplateLabels,
  postJobTemplateLaunch,
  processJobTemplate,
} from './controller/controllerJobTemplates';
import { processProject } from './controller/controllerProcessProject';
import { getProjectPlaybooks } from './controller/controllerProjectPlaybooks';
import { controllerRelations } from './controller/controllerRelations';
import { getUnifiedJobs } from './controller/controllerUnifiedJobs';
import { getUnifiedTemplates } from './controller/controllerUnifiedTemplates';
import { getGatewayAppUrls } from './gateway/gatewayAppUrls';
import { gatewayRelations } from './gateway/gatewayRelations';
import { authenticatedGuard } from './handlers/authenticatedGuard';
import { deleteItem } from './handlers/deleteItem';
import { gatewayApiRoute } from './handlers/gatewayApiRoute';
import { getData } from './handlers/getData';
import { getItem } from './handlers/getItem';
import { getItemOptions } from './handlers/getItemOptions';
import { getItems } from './handlers/getItems';
import { getOptions } from './handlers/getOptions';
import { patchData } from './handlers/patchData';
import { postGatewayLogin } from './handlers/postGatewayLogin';
import { postGatewayLogout } from './handlers/postGatewayLogout';
import { postItem } from './handlers/postItem';
import { Router } from './mock-router';

export function createMock() {
  const context: MockContext = JSON.parse(JSON.stringify(mockContext)) as MockContext;

  // Router - Stack of routes - Stops at first matching route that returns a response
  const router = new Router()
    .GET('/api', gatewayApiRoute)

    .GET('/api/gateway/v1/login', () => ({ status: 200 }))
    .POST('/api/gateway/v1/login', postGatewayLogin)
    .POST('/api/gateway/v1/logout', postGatewayLogout)
    .GET('/api/gateway/v1/ui_auth', getData())
    .GET('/api/gateway/v1/legacy_auth', getData())
    .GET('/api/gateway/v1/ping', () => ({ status: 200 }))
    .GET('/api/galaxy/_ui/v1/settings', getData())
    .GET('/api/controller/v2/auth', getData())

    // --- Only routes before this can be accessed unauthenticated ---
    .GET('/api/*subpath', authenticatedGuard)

    // Gateway API
    .GET('/api/gateway/v1/session', () => ({ status: 200 }))
    .GET('/api/gateway/v1/app_urls', getGatewayAppUrls)

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

    .OPTIONS('/api/controller/v2/settings/all', getOptions())
    .GET('/api/controller/v2/settings/all', getData())
    .OPTIONS('/api/controller/v2/settings/policyascode/', getOptions())
    .GET('/api/controller/v2/settings/policyascode/', getData())
    .PATCH('/api/controller/v2/settings/policyascode/', patchData())
    .GET('/api/controller/v2/feature_flags_state/', getData())

    // Special handling
    .POST(
      '/api/controller/v2/projects',
      postItem({ relations: controllerRelations, process: processProject })
    )
    .GET('/api/controller/v2/projects/:id/playbooks', getProjectPlaybooks)
    .GET('/api/controller/v2/unified_jobs', getUnifiedJobs)
    .GET('/api/controller/v2/unified_job_templates', getUnifiedTemplates)
    .POST(
      '/api/controller/v2/job_templates',
      postItem({ relations: controllerRelations, process: processJobTemplate })
    )
    .GET('/api/controller/v2/job_templates/:id/launch', getJobTemplateLaunch)
    .POST('/api/controller/v2/job_templates/:id/launch', postJobTemplateLaunch)
    .POST('/api/controller/v2/job_templates/:id/labels', postJobTemplateLabels)
    .GET('/api/controller/v2/jobs/:id/job_events/children_summary', getJobEventsChildrenSummary)
    .GET('/api/controller/v2/jobs/:id/job_events', getJobEvents)
    // .GET('/api/controller/v2/workflow_jobs/:id/workflow_nodes', TODO)
    .PATCH('/api/controller/v2/settings/', patchData())

    // Controller Resource API
    .OPTIONS('/api/controller/v2/:resource', getOptions())
    .GET('/api/controller/v2/:resource', getItems(controllerRelations))
    .POST('/api/controller/v2/:resource', postItem({ relations: controllerRelations }))
    .OPTIONS('/api/controller/v2/:resource/:id', getItemOptions())
    .GET('/api/controller/v2/:resource/:id', getItem(controllerRelations))
    .DELETE('/api/controller/v2/:resource/:id', deleteItem())

    // EDA Resource API
    .OPTIONS('/api/eda/v1/:resource', getOptions())
    .GET('/api/eda/v1/:resource', getItems())
    .POST('/api/eda/v1/:resource', postItem())
    .OPTIONS('/api/eda/v1/:resource/:id', getItemOptions())
    .GET('/api/eda/v1/:resource/:id', getItem())
    .DELETE('/api/eda/v1/:resource/:id', deleteItem());

  return { router, context };
}
