import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGet } from '../../../../common/crud/useGet';
import { HubItemsResponse } from '../../../common/useHubView';
import { hubAPI } from '../../../common/api/formatPath';
import { HubError } from '../../../common/HubError';
import { HubRoute } from '../../../main/HubRoutes';
import { useRemoteRegistryActions } from '../hooks/useRemoteRegistryActions';
import { RemoteRegistry } from '../RemoteRegistry';

export function RemoteRegistryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const pageActions = useRemoteRegistryActions({
    onRemoteRegistryDeleted: () => pageNavigate(HubRoute.RemoteRegistries),
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
              position={DropdownPosition.right}
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
