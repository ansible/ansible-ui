import { ContentTypeMetadata } from '@ansible/common-ui/access/roles/ContentTypeMetadata';
import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxContentType } from './AwxContentType';

export function useAwxContentTypeMetadata(): Record<AwxContentType, ContentTypeMetadata> {
  return {
    [AwxContentType.Credential]: {
      apiEndpoint: awxAPI`/credentials/`,
      detailsPageId: AwxRoute.CredentialDetails,
    },
    [AwxContentType.ExecutionEnvironement]: {
      apiEndpoint: awxAPI`/execution_environments/`,
      detailsPageId: AwxRoute.ExecutionEnvironmentDetails,
    },
    [AwxContentType.InstanceGroup]: {
      apiEndpoint: awxAPI`/instance_groups/`,
      detailsPageId: AwxRoute.InstanceGroupDetails,
    },
    [AwxContentType.Inventory]: {
      apiEndpoint: awxAPI`/inventories/`,
      detailsPageId: AwxRoute.InventoryDetails,
    },
    [AwxContentType.JobTemplate]: {
      apiEndpoint: awxAPI`/job_templates/`,
      detailsPageId: AwxRoute.JobTemplateDetails,
    },
    [AwxContentType.NotificationTemplate]: {
      apiEndpoint: awxAPI`/notification_templates/`,
      detailsPageId: AwxRoute.NotificationTemplateDetails,
    },
    [AwxContentType.Project]: {
      apiEndpoint: awxAPI`/projects/`,
      detailsPageId: AwxRoute.ProjectDetails,
    },
    [AwxContentType.WorkflowJobTemplate]: {
      apiEndpoint: awxAPI`/workflow_job_templates/`,
      detailsPageId: AwxRoute.WorkflowJobTemplateDetails,
    },
    [SharedContentType.Organization]: {
      apiEndpoint: awxAPI`/organizations/`,
      detailsPageId: AwxRoute.OrganizationDetails,
    },
    [SharedContentType.Team]: {
      apiEndpoint: awxAPI`/teams/`,
      detailsPageId: AwxRoute.TeamDetails,
    },
  };
}
