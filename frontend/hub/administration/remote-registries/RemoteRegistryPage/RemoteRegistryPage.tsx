import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { hubAPI } from '../../../common/api/formatPath';
import { HubError } from '../../../common/HubError';
import { HubItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { useRemoteRegistryActions } from '../hooks/useRemoteRegistryActions';
import { RemoteRegistry } from '../RemoteRegistry';

export function RemoteRegistryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageActions = useRemoteRegistryActions({
    onRemoteRegistryDeleted: () => {},
  });

  const {
    data: remoteRegistryData,
    error: errorRemoteRegistry,
    refresh: refreshRemoteRegistry,
  } = useGet<HubItemsResponse<RemoteRegistry>>(
    hubAPI`/_ui/v1/execution-environments/registries/?name=${params.id}`
  );

  if (errorRemoteRegistry) {
    return <HubError error={errorRemoteRegistry} handleRefresh={refreshRemoteRegistry} />;
  }
  if (!remoteRegistryData) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const remoteRegistry = remoteRegistryData?.data?.[0];

  return (
    <>
      <PageLayout>
        <PageHeader
          title={remoteRegistry?.name}
          breadcrumbs={[
            { label: t('Remote registries'), to: getPageUrl(HubRoute.RemoteRegistries) },
            { label: remoteRegistry?.name },
          ]}
          headerActions={
            <PageActions<RemoteRegistry>
              actions={pageActions}
              position={'right'}
              selectedItem={remoteRegistry}
            />
          }
        />
        <PageRoutedTabs
          backTab={{
            label: t('Back to Remote Registries'),
            page: HubRoute.RemoteRegistries,
            persistentFilterKey: '',
          }}
          tabs={[
            {
              label: t('Details'),
              page: HubRoute.RemoteRegistryDetails,
            },
          ]}
          params={{ id: params.id }}
        />
      </PageLayout>
    </>
  );
}
