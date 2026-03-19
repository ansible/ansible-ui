import { Config } from '../interfaces/Config';
import { useDocsVersion } from './useDocsVersion';
import docsUrls from './docsUrls.json';

export interface DocPathDictionary {
  credentialTypes?: string;
  credentials?: string;
  organizations?: string;
  teams?: string;
  users?: string;
  activityStream?: string;
  applications?: string;
  authenticationMethods?: string;
  roles?: string;
  oAuthApplications?: string;
  executionEnvironments?: string;
  managementJobs?: string;
  notifiers?: string;
  topology?: string;
  workflows?: string;
  jobTemplateSurveys?: string;
  index?: string;
  hosts?: string;
  inventories?: string;
  constructedInventories?: string;
  managePlaybooksSC?: string;
  projects?: string;
  templates?: string;
  workflowVisualizer?: string;
  workflowVisBuild?: string;
  jobs?: string;
  schedules?: string;
  instanceGroups?: string;
  instances: string;
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
  const { version } = useDocsVersion() || { version: '2.6' };
  const path = (docsUrls as DocPathDictionary)[doc] || (docsUrls as DocPathDictionary).index || '';
  if (!config) {
    return `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${path}`;
  }

  const licenseType = config?.license_info?.license_type;
  if (licenseType && licenseType !== 'open') {
    return `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${path}`;
  } else {
    // For upstream/community, always return the community docs homepage
    return 'https://docs.ansible.com/';
  }
}
