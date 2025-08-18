import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI, pulpAPI } from '@ansible/hub-ui/common/api/formatPath';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useCallback } from 'react';

export function useGetResourceEndpoint(
  contentType: string | null,
  objectId: string | number | null
) {
  const getEndpoint = useCallback(() => {
    if (contentType === null || objectId === null) {
      return undefined;
    }

    const resourceToEndpointMapping: { [key: string]: string } = {
      'eda.edacredential': edaAPI`/eda-credentials/`,
      'eda.project': edaAPI`/projects/`,
      'eda.activation': edaAPI`/activations/`,
      'eda.rulebook': edaAPI`/rulebooks/`,
      'eda.rulebookprocess': edaAPI`/activation-instances/`,
      'eda.credentialtype': edaAPI`/credential-types/`,
      'eda.decisionenvironment': edaAPI`/decision-environments/`,
      'eda.auditrule': edaAPI`/audit-rules/`,
      'eda.eventstream': edaAPI`/event-streams/`,
      'awx.credential': awxAPI`/credentials/`,
      'awx.executionenvironment': awxAPI`/execution_environments/`,
      'awx.instancegroup': awxAPI`/instance_groups/`,
      'awx.inventory': awxAPI`/inventories/`,
      'awx.jobtemplate': awxAPI`/job_templates/`,
      'awx.notificationtemplate': awxAPI`/notification_templates/`,
      'awx.project': awxAPI`/projects/`,
      'awx.workflowjobtemplate': awxAPI`/workflow_job_templates/`,
      'galaxy.namespace': hubAPI`/_ui/v1/namespaces/`,
      'galaxy.ansiblerepository': pulpAPI`/repositories/ansible/ansible/`,
      'galaxy.containernamespace': hubAPI`/v3/plugin/execution-environments/repositories/`,
      'galaxy.collectionremote': pulpAPI`/remotes/ansible/collection/`,
      'shared.organization': gatewayAPI`/organizations/`,
      'shared.team': gatewayAPI`/teams/`,
    };

    return resourceToEndpointMapping[contentType];
  }, [contentType, objectId]);

  return getEndpoint();
}
