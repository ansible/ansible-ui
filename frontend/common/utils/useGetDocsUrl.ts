import { Config } from '../interfaces/Config';
import { useDocsVersion } from './useDocsVersion';

export interface DocPathDictionary {
  credentialTypes: string;
  credentials: string;
  organizations: string;
  teams: string;
  users: string;
  activityStream: string;
  applications: string;
  authenticationMethods?: string;
  roles?: string;
  oAuthApplications?: string;
  executionEnvironments: string;
  managementJobs: string;
  notifiers: string;
  topology: string;
  workflows: string;
  jobTemplateSurveys: string;
  index: string;
  hosts: string;
  inventories: string;
  constructedInventories: string;
  managePlaybooksSC: string;
  projects: string;
  templates: string;
  workflowVisualizer: string;
  workflowVisBuild: string;
  jobs: string;
  schedules: string;
  instanceGroups: string;
  instances: string;
  automationContentExecutionEnvironments?: string;
  ruleAudit?: string;
  rulebookActivations?: string;
  edaProjects?: string;
  decisionEnvironments?: string;
  eventStreams?: string;
  edaCredentials?: string;
  edaCredentialTypes?: string;
  hubExecutionEnvironments?: string;
  signatureKeys?: string;
  repositories?: string;
  remoteRegistries?: string;
  taskManagement?: string;
  collectionApprovals?: string;
  remotes?: string;
  apiToken?: string;
  automationCalculator?: string;
  hostMetrics?: string;
  configureAnalytics?: string;
}

export function useGetDocsUrl(
  config: Config | null | undefined,
  doc: keyof DocPathDictionary
): string {
  const { version } = useDocsVersion() || { version: '2.5' };
  if (!config) {
    return `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${downstreamPaths[doc]}`;
  } else {
    const licenseType = config?.license_info?.license_type;
    if (licenseType && licenseType !== 'open') {
      return `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${downstreamPaths[doc]}`;
    } else {
      // For upstream/community, always return the community docs homepage
      return 'https://docs.ansible.com/';
    }
  }
}

export const downstreamPaths: DocPathDictionary = {
  // Platform documentation routes
  organizations:
    'html/access_management_and_authentication/gw-managing-access#assembly-controller-organizations_gw-manage-rbac',
  teams:
    'html/access_management_and_authentication/gw-managing-access#assembly-controller-teams_gw-manage-rbac',
  users:
    'html/access_management_and_authentication/gw-managing-access#assembly-controller-users_gw-manage-rbac',
  activityStream: 'html/using_automation_execution/assembly-controller-activity-stream',
  applications: 'html/access_management_and_authentication/gw-token-based-authentication',
  roles: 'html/access_management_and_authentication/assembly-gw-roles',
  authenticationMethods:
    'html/access_management_and_authentication/gw-configure-authentication#gw-config-authentication-type',
  oAuthApplications: 'html/access_management_and_authentication/gw-token-based-authentication',

  // Controller documentation routes
  credentialTypes: 'html/using_automation_execution/assembly-controller-custom-credentials',
  credentials: 'html/using_automation_execution/controller-credentials',
  executionEnvironments:
    'html/using_automation_execution/assembly-controller-execution-environments',
  managementJobs: 'html/configuring_automation_execution/assembly-controller-management-jobs',
  notifiers: 'html/using_automation_execution/controller-notifications',
  topology: 'html/using_automation_execution/assembly-controller-topology-viewer',
  workflows:
    'html/using_automation_execution/controller-workflow-job-templates#controller-approval-nodes',
  jobTemplateSurveys:
    'html/using_automation_execution/controller-job-templates#controller-surveys-in-job-templates',
  index: 'html/using_automation_execution/index',
  hosts: 'html/using_automation_execution/assembly-controller-hosts',
  inventories: 'html/using_automation_execution/controller-inventories',
  constructedInventories:
    'html/using_automation_execution/controller-inventories#ref-controller-constructed-inventories',
  managePlaybooksSC:
    'html/using_automation_execution/controller-projects#ref-projects-manage-playbooks-with-source-control',
  projects: 'html/using_automation_execution/controller-projects',
  templates: 'html/using_automation_execution/controller-job-templates',
  workflowVisualizer:
    'html/using_automation_execution/controller-workflow-job-templates#controller-workflow-visualizer',
  workflowVisBuild:
    'html/using_automation_execution/controller-workflow-job-templates#controller-build-workflow',
  jobs: 'html/using_automation_execution/controller-jobs',
  schedules: 'html/using_automation_execution/controller-schedules',
  instanceGroups: 'html/using_automation_execution/controller-instance-groups',
  instances: 'html/using_automation_execution/assembly-controller-instances',

  // EDA documentation routes
  ruleAudit: 'html/using_automation_decisions/eda-rule-audit',
  rulebookActivations: 'html/using_automation_decisions/eda-rulebook-activations',
  edaProjects: 'html/using_automation_decisions/eda-projects',
  decisionEnvironments: 'html/using_automation_decisions/eda-decision-environments',
  eventStreams: 'html-single/using_automation_decisions/index#event-streams',
  edaCredentials: 'html/using_automation_decisions/eda-credentials',
  edaCredentialTypes: 'html/using_automation_decisions/eda-credential-types',

  // Hub documentation routes
  hubExecutionEnvironments: 'html-single/managing_automation_content/index#container-registries',
  signatureKeys:
    'html-single/managing_automation_content/index#proc-downloading-signature-public-keys',
  repositories: 'html-single/managing_automation_content/index#repo-management',
  remoteRegistries:
    'html-single/managing_automation_content/index#adding-containers-remotely-to-the-automation-hub',
  taskManagement: 'html-single/managing_automation_content/index#repository-sync',
  collectionApprovals:
    'html-single/managing_automation_content/index#assembly-managing-private-collections',
  remotes: 'html-single/managing_automation_content/index#proc-create-remote_remote-management',
  apiToken: 'html-single/managing_automation_content/index#proc-create-remote_remote-management',

  // Automation analytics documentation routes
  automationCalculator:
    'html-single/using_automation_analytics/index#assembly-evaluating-automation-return',
  hostMetrics:
    'html-single/configuring_automation_execution/index#ref-controller-analytics-reports',
  configureAnalytics:
    'html/configuring_automation_execution/controller-usability-analytics-data-collection',
};
