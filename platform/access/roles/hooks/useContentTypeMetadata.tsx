import { useAwxContentTypeMetadata } from '@ansible/awx-ui/access/roles/hooks/useAwxContentTypeMetadata';
import { ContentTypeMetadata } from '@ansible/common-ui/access/roles/ContentTypeMetadata';
import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { useEdaContentTypeMetadata } from '@ansible/eda-ui/access/roles/hooks/useEdaContentTypeMetadata';
import { useHubContentTypeMetadata } from '@ansible/hub-ui/access/roles/hooks/useHubContentTypeMetadata';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { ContentType } from './ContentType';

/**
 * Hook to retrieve metadata for all content types across the platform.
 * @returns A record mapping each content type to its metadata.
 */
export function useContentTypeMetadata(): Record<ContentType, ContentTypeMetadata> {
  const awxContentTypeMetadata = useAwxContentTypeMetadata();
  const edaContentTypeMetadata = useEdaContentTypeMetadata();
  const hubContentTypeMetadata = useHubContentTypeMetadata();
  return {
    ...awxContentTypeMetadata,
    ...edaContentTypeMetadata,
    ...hubContentTypeMetadata,

    // Platform overrides for shared content types
    [SharedContentType.Organization]: {
      apiEndpoint: gatewayAPI`/organizations/`,
      detailsPageId: PlatformRoute.OrganizationDetails,
    },
    [SharedContentType.Team]: {
      apiEndpoint: gatewayAPI`/teams/`,
      detailsPageId: PlatformRoute.TeamDetails,
    },
  };
}
