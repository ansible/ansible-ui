import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet } from '../../../../common/crud/useGet';
import { HubError } from '../../../common/HubError';
import { pulpAPI } from '../../../common/api/formatPath';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from './../Remotes';
import { useRemoteActions } from './../hooks/useRemoteActions';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';

function useErrorHandlerAndLoading<T>(
  data: T | undefined,
  error: Error | undefined,
  refresh?: () => void
) {
  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!data) {
    return <LoadingPage breadcrumbs tabs />;
  }

  return null;
}

export function RemotePage() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const pageActions = useRemoteActions({
    onRemotesDeleted: () => pageNavigate(HubRoute.Remotes),
  });
  const params = useParams<{ id: string }>();
  const {
    data: remotesData,
    error: errorRemotes,
    refresh: refreshRemotes,
  } = useGet<PulpItemsResponse<HubRemote>>(pulpAPI`/remotes/ansible/collection/?name=${params.id}`);
  const remote = remotesData?.results?.[0];

  const loadingOrErrorRemotes = useErrorHandlerAndLoading(remote, errorRemotes, refreshRemotes);

  if (loadingOrErrorRemotes) return loadingOrErrorRemotes;

  return (
    <>
      <PageLayout>
        <PageHeader
          title={remote?.name}
          breadcrumbs={[
            { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
            { label: remote?.name },
          ]}
          headerActions={
            <PageActions<HubRemote>
              actions={pageActions}
              position={DropdownPosition.right}
              selectedItem={remote}
            />
          }
        />
        <PageRoutedTabs
          backTab={{
            label: t('Back to Remotes'),
            page: HubRoute.Remotes,
            persistentFilterKey: '',
          }}
          tabs={[
            {
              label: t('Details'),
              page: HubRoute.RemoteDetails,
            },
            {
              label: t('Access'),
              page: HubRoute.RemoteAccess,
            },
          ]}
          params={{ id: params.id }}
          componentParams={{ id: params.id, remote: remote }}
        />
      </PageLayout>
    </>
  );
}
