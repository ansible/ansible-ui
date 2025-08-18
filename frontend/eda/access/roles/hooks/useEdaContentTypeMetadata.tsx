import { ContentTypeMetadata } from '@ansible/common-ui/access/roles/ContentTypeMetadata';
import { edaAPI } from '../../../common/eda-utils';
import { EdaRoute } from '../../../main/EdaRoutes';
import { EdaContentType } from './EdaContentType';

export function useEdaContentTypeMetadata(): Record<EdaContentType, ContentTypeMetadata> {
  return {
    [EdaContentType.Activation]: {
      apiEndpoint: edaAPI`/activations/`,
      detailsPageId: EdaRoute.RulebookActivationDetails,
    },
    [EdaContentType.AuditRule]: {
      apiEndpoint: edaAPI`/auditrules/`,
      detailsPageId: EdaRoute.RuleAuditDetails,
    },
    [EdaContentType.Credential]: {
      apiEndpoint: edaAPI`/credentials/`,
      detailsPageId: EdaRoute.CredentialDetails,
    },
    [EdaContentType.DecisionEnvironment]: {
      apiEndpoint: edaAPI`/decision_environments/`,
      detailsPageId: EdaRoute.DecisionEnvironmentDetails,
    },
    [EdaContentType.EventStream]: {
      apiEndpoint: edaAPI`/event_streams/`,
      detailsPageId: EdaRoute.EventStreamDetails,
    },
    [EdaContentType.Project]: {
      apiEndpoint: edaAPI`/projects/`,
      detailsPageId: EdaRoute.ProjectDetails,
    },
    [EdaContentType.Rulebook]: {
      apiEndpoint: edaAPI`/rulebooks/`,
    },
    [EdaContentType.RulebookProcess]: {
      apiEndpoint: edaAPI`/rulebook_processes/`,
      detailsPageId: EdaRoute.RulebookActivationInstanceDetails,
    },
    [EdaContentType.Organization]: {
      apiEndpoint: edaAPI`/organizations/`,
      detailsPageId: EdaRoute.OrganizationDetails,
    },
    [EdaContentType.Team]: {
      apiEndpoint: edaAPI`/teams/`,
      detailsPageId: EdaRoute.TeamDetails,
    },
  };
}
