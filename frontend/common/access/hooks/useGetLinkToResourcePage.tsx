import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { EdaRoute } from '@ansible/eda-ui/main/EdaRoutes';
import { HubRoute } from '@ansible/hub-ui/main/HubRoutes';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { useCallback } from 'react';

export function useGetLinkToResourcePage(name?: string | undefined) {
  const getPageUrl = useGetPageUrl();
  return useCallback(
    (options: { contentType: string | null; objectId: string | number | null }) => {
      const { contentType, objectId } = options;
      if (contentType === null || objectId === null) {
        // Content type and object ID will be null for the System Auditor role
        return undefined;
      }
      const resourceToEndpointMapping: { [key: string]: string } = {
        'eda.edacredential': getPageUrl(EdaRoute.CredentialDetails, { params: { id: objectId } }),
        'eda.project': getPageUrl(EdaRoute.ProjectDetails, { params: { id: objectId } }),
        'eda.activation': getPageUrl(EdaRoute.RulebookActivationDetails, {
          params: { id: objectId },
        }),
        'eda.rulebookprocess': getPageUrl(EdaRoute.RulebookActivationInstanceDetails, {
          params: { id: objectId },
        }),
        'eda.credentialtype': getPageUrl(EdaRoute.CredentialTypeDetails, {
          params: { id: objectId },
        }),
        'eda.decisionenvironment': getPageUrl(EdaRoute.DecisionEnvironmentDetails, {
          params: { id: objectId },
        }),
        'eda.auditrule': getPageUrl(EdaRoute.RuleAuditDetails, { params: { id: objectId } }),
        'awx.credential': getPageUrl(AwxRoute.CredentialDetails, { params: { id: objectId } }),
        'awx.executionenvironment': getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
          params: { id: objectId },
        }),
        'awx.instancegroup': getPageUrl(AwxRoute.InstanceGroupDetails, {
          params: { id: objectId },
        }),
        'awx.inventory': getPageUrl(AwxRoute.InventoryDetails, {
          params: { id: objectId, inventory_type: 'inventory' },
        }),
        'awx.jobtemplate': getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: objectId } }),
        'awx.notificationtemplate': getPageUrl(AwxRoute.NotificationTemplateDetails, {
          params: { id: objectId },
        }),
        'awx.workflowjobtemplate': getPageUrl(AwxRoute.WorkflowJobTemplateDetails, {
          params: { id: objectId },
        }),
        'awx.project': getPageUrl(AwxRoute.ProjectDetails, { params: { id: objectId } }),
        'galaxy.namespace': getPageUrl(HubRoute.NamespaceDetails, {
          params: { id: name ?? objectId },
        }),
        'galaxy.ansiblerepository': getPageUrl(HubRoute.RepositoryDetails, {
          params: { id: name ?? objectId },
        }),
        'galaxy.containernamespace': getPageUrl(HubRoute.ExecutionEnvironmentDetails, {
          params: { id: name ?? objectId },
        }),
        'galaxy.containerrepository': getPageUrl(HubRoute.RepositoryDetails, {
          params: { id: name ?? objectId },
        }),
        'galaxy.collectionremote': getPageUrl(HubRoute.RemoteDetails, {
          params: { id: name ?? objectId },
        }),
        'shared.team': getPageUrl(PlatformRoute.TeamDetails, { params: { id: objectId } }),
        'shared.organization': getPageUrl(PlatformRoute.OrganizationDetails, {
          params: { id: objectId },
        }),
      };
      return resourceToEndpointMapping[contentType] ?? undefined;
    },
    [getPageUrl, name]
  );
}
