/**
 * Central export for all resource utilities
 *
 * Usage:
 *   import { Organization, Team, User } from '@ansible/playwright/utils';
 *
 *   // API operations (fast, for setup/teardown)
 *   const org = await Organization.api.create(page, { name: 'Test Org' });
 *   const team = await Team.api.create(page, { organizationId: org.id });
 *   const user = await User.api.create(page, { username: 'testuser' });
 *
 *   // UI operations (for testing UI workflows)
 *   const orgName = await Organization.ui.create(page, { organizationName: 'Test Org' });
 *   await Team.ui.delete(page, 'Test Team');
 *
 */

// Resource modules - Access Management
export { Organization } from './organization';
export { Team } from './team';
export { User } from './user';
export { Role, TEST_ROLE_CONFIGS } from './role';

// Resource modules - Automation Execution (AWX)
export { Credential } from './credential';
export { CredentialType } from './credentialType';
export { ExecutionEnvironment } from './executionEnvironment';
export { Host } from './host';
export { Instance } from './instance';
export { InstanceGroup } from './instanceGroup';
export { Inventory } from './inventory';
export { InventoryGroup } from './inventoryGroup';
export { InventoryHost } from './inventoryHost';
export { JobTemplate } from './jobTemplate';
export { Notifier } from './notifier';
export { Project } from './project';
export { Schedule } from './schedule';
export { Settings } from './settings';
export type { SystemSettings } from './settings';
export { WorkflowApproval } from './workflowApproval';
export { WorkflowJobTemplate } from './workflowJobTemplate';
export { WorkflowVisualizer } from './workflowVisualizer';
export {
  JobTemplateSurvey,
  WorkflowJobTemplateSurvey,
  createTemplateSurveyHelper,
} from './templateSurvey';

// Resource modules - Automation Decisions (EDA)
export { DecisionEnvironment } from './decisionEnvironment';
export { EdaCredential } from './edaCredential';
export { EdaCredentialType } from './edaCredentialType';
export { EdaOrganization } from './edaOrganization';
export { EdaProject } from './edaProject';
export { EdaRulebook } from './edaRulebook';
export { EventStream } from './eventStream';
export { RulebookActivation } from './rulebookActivation';

// Resource modules - Automation Content (Hub)
export { Namespace } from './namespace';
export { RemoteRegistry } from './remoteRegistry';
export { ExecutionEnvironment as HubExecutionEnvironment } from './hub';
export type { CreateExecutionEnvironmentOptions } from './hub';

// Resource modules - Platform
export { Authentication } from './authentication';
export { Lightspeed } from './lightspeed';

// Re-export commonly used resource types
export type { RoleTestData } from './role';
export type { SurveyQuestion } from './templateSurvey';
