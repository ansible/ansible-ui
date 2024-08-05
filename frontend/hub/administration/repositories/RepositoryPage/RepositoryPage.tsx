import { DropdownPosition } from '@patternfly/react-core/dist/esm/deprecated';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { StatusCell } from '../../../../common/Status';
import { useGet } from '../../../../common/crud/useGet';
import { HubError } from '../../../common/HubError';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';
import { useRepositoryActions } from '../hooks/useRepositoryActions';

export function RepositoryPage() {
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const headerActions = useRepositoryActions({
    onRepositoriesDeleted: () => pageNavigate(HubRoute.Repositories),
  });
  const getPageUrl = useGetPageUrl();
  const { t } = useTranslation();

  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;

  const breadcrumbs = [
    { label: t('Repositories'), to: getPageUrl(HubRoute.Repositories) },
    { label: params.id },
  ];

  const repository = data?.results.length > 0 ? data?.results[0] : undefined;
  const repo_id: string = parsePulpIDFromURL(repository?.pulp_href) || '';
  return (
    <>
      <PageLayout>
        <PageHeader
          title={params.id}
          headerActions={
            <PageActions
              actions={headerActions}
              position={DropdownPosition.right}
              selectedItem={repository}
            />
          }
          footer={
            !!repository &&
            !!repository.last_sync_task && (
              <div>
                <Trans>
                  Last updated from registry{' '}
                  {<DateTimeCell value={repository.last_sync_task?.finished_at} />}
                </Trans>
                <StatusCell status={repository.last_sync_task?.state} />
              </div>
            )
          }
          breadcrumbs={breadcrumbs}
        />
        <PageRoutedTabs
          backTab={{
            label: t('Back to Repositories'),
            page: HubRoute.Repositories,
            persistentFilterKey: '',
          }}
          tabs={[
            {
              label: t('Details'),
              page: HubRoute.RepositoryDetails,
            },
            {
              label: t('Access'),
              page: HubRoute.RepositoryAccess,
            },
            {
              label: t('Collection Versions'),
              page: HubRoute.RepositoryCollectionVersion,
            },
            {
              label: t('Versions'),
              page: HubRoute.RepositoryVersions,
            },
          ]}
          params={{ id: params.id, repo_id: repo_id }}
          componentParams={{ id: params.id, repo_id: repo_id, repository: repository }}
        />
      </PageLayout>
    </>
  );
}
