import { Config } from '../../interfaces/Config';
import { useDocsVersion } from '../useDocsVersion';

export interface DocPathDictionary {
  credentialTypes: string;
  credentials: string;
  organizations: string;
  teams: string;
  users: string;
  activityStream: string;
  applications: string;
  executionEnvironments: string;
  managementJobs: string;
  notifiers: string;
  topology: string;
  workflows: string;
  eeMigration: string;
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
}

export function useGetDocsUrl(
  config: Config | null | undefined,
  doc: keyof DocPathDictionary
): string {
  const { version } = useDocsVersion() || { version: '2.5' };
  const licenseType = config?.license_info?.license_type;
  if (licenseType && licenseType !== 'open') {
    return `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/html/${downstreamPaths[doc]}`;
  } else {
    return `https://ansible.readthedocs.io/projects/awx/en/latest/${upstreamPaths[doc]}`;
  }
}

const upstreamPaths: DocPathDictionary = {
  credentialTypes: 'userguide/credential_types.html',
  credentials: 'userguide/credentials.html',
  organizations: 'userguide/organizations.html',
  teams: 'userguide/teams.html',
  users: 'userguide/users.html',
  activityStream: 'userguide/main_menu.html#activity-stream',
  applications: 'userguide/applications_auth.html',
  executionEnvironments: 'userguide/execution_environments.html',
  managementJobs: 'userguide/management_jobs.html',
  notifiers: 'userguide/notifications.html',
  topology: 'userguide/topology_viewer.html',
  workflows: 'userguide/workflows.html',
  eeMigration: 'upgrade-migration-guide/upgrade_to_ees.html',
  jobTemplateSurveys: 'userguide/job_templates.html#surveys',
  index: 'userguide/index.html',
  hosts: 'userguide/hosts.html',
  inventories: 'userguide/inventories.html',
  constructedInventories: 'userguide/inventories.html#constructed-inventories',
  managePlaybooksSC: 'userguide/projects.html#manage-playbooks-using-source-control',
  projects: 'userguide/projects.html',
  templates: 'userguide/job_templates.html',
  workflowVisualizer: 'userguide/workflow_templates.html#ug-wf-editor',
  workflowVisBuild: 'userguide/workflow_templates.html#converge-node',
  jobs: 'userguide/jobs.html',
  schedules: 'userguide/scheduling.html',
};

const downstreamPaths: DocPathDictionary = {
  credentialTypes: 'automation_controller_user_guide/assembly-controller-custom-credentials',
  credentials: 'automation_controller_user_guide/controller-credentials',
  organizations: 'automation_controller_user_guide/assembly-controller-organizations',
  teams: 'automation_controller_user_guide/assembly-controller-teams',
  users: 'automation_controller_user_guide/assembly-controller-users',
  activityStream: 'automation_controller_user_guide/assembly-controller-activity-stream',
  applications: 'automation_controller_user_guide/assembly-controller-applications',
  executionEnvironments:
    'automation_controller_user_guide/assembly-controller-execution-environments',
  managementJobs: 'automation_controller_user_guide/assembly-controller-management-jobs',
  notifiers: 'automation_controller_user_guide/assembly-controller-notifications',
  topology: 'automation_controller_user_guide/assembly-controller-topology-viewer',
  workflows: 'automation_controller_user_guide/assembly-controller-workflows',
  eeMigration: 'red_hat_ansible_automation_platform_upgrade_and_migration_guide/upgrading-to-ees',
  jobTemplateSurveys:
    'automation_controller_user_guide/controller-job-templates#controller-surveys-in-job-templates',
  index: 'automation_controller_user_guide/index',
  hosts: 'automation_controller_user_guide/assembly-controller-hosts',
  inventories: 'automation_controller_user_guide/controller-inventories',
  constructedInventories:
    'automation_controller_user_guide/controller-inventories#ref-controller-constructed-inventories',
  managePlaybooksSC:
    'automation_controller_user_guide/controller-projects#ref-projects-manage-playbooks-with-source-control',
  projects: 'automation_controller_user_guide/controller-projects',
  templates: 'automation_controller_user_guide/controller-job-templates',
  workflowVisualizer:
    'automation_controller_user_guide/controller-workflow-job-templates#controller-workflow-visualizer',
  workflowVisBuild:
    'automation_controller_user_guide/controller-workflow-job-templates#controller-build-workflow',
  jobs: 'automation_controller_user_guide/controller-jobs',
  schedules: 'automation_controller_user_guide/controller-schedules',
};
