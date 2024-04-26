import { useCallback } from 'react';
import { useGetPageUrl } from '../../../../framework';
import { AwxRoute } from '../../../awx/main/AwxRoutes';
import { EdaRoute } from '../../../eda/main/EdaRoutes';

export function useGetLinkToResourcePage() {
  const getPageUrl = useGetPageUrl();
  return useCallback(
    (options: { contentType: string; objectId: string | number }) => {
      const { contentType, objectId } = options;
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
        'awx.inventory': getPageUrl(AwxRoute.InventoryDetails, { params: { id: objectId } }),
        'awx.jobtemplate': getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: objectId } }),
        'awx.notificationtemplate': getPageUrl(AwxRoute.NotificationTemplateDetails, {
          params: { id: objectId },
        }),
        'awx.workflowjobtemplate': getPageUrl(AwxRoute.WorkflowJobTemplateDetails, {
          params: { id: objectId },
        }),
        'awx.project': getPageUrl(AwxRoute.ProjectDetails, { params: { id: objectId } }),
      };
      return resourceToEndpointMapping[contentType] ?? undefined;
    },
    [getPageUrl]
  );
}
