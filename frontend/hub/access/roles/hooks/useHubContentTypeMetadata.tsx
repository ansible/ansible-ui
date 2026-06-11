import { ContentTypeMetadata } from '@ansible/common-ui/access/roles/ContentTypeMetadata';
import { hubAPI } from '../../../common/api/formatPath';
import { HubRoute } from '../../../main/HubRoutes';
import { HubContentType } from './HubContentType';

export function useHubContentTypeMetadata(): Record<HubContentType, ContentTypeMetadata> {
  return {
    [HubContentType.Namespace]: {
      apiEndpoint: hubAPI`/namespaces/`,
      detailsPageId: HubRoute.NamespaceDetails,
    },
    [HubContentType.Collection]: {
      apiEndpoint: hubAPI`/collections/`,
      detailsPageId: HubRoute.CollectionDetails,
    },
    [HubContentType.ExecutionEnvironment]: {
      apiEndpoint: hubAPI`/execution_environments/`,
      detailsPageId: HubRoute.ExecutionEnvironmentDetails,
    },
    [HubContentType.ContainerRegistryRemote]: {
      apiEndpoint: hubAPI`/container_registry_remotes/`,
    },
    [HubContentType.SyncList]: {
      apiEndpoint: hubAPI`/sync_lists/`,
    },
    [HubContentType.Task]: {
      apiEndpoint: hubAPI`/tasks/`,
    },
    [HubContentType.CollectionRemote]: {
      apiEndpoint: hubAPI`/collection_remotes/`,
    },
    [HubContentType.Repository]: {
      apiEndpoint: hubAPI`/repositories/`,
      detailsPageId: HubRoute.RepositoryDetails,
    },
    [HubContentType.System]: {
      apiEndpoint: hubAPI`/system/`,
    },
    [HubContentType.Team]: {
      apiEndpoint: hubAPI`/teams/`,
      detailsPageId: HubRoute.TeamDetails,
    },
  };
}
