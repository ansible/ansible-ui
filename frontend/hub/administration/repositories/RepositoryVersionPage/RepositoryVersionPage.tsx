import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGet } from '../../../../common/crud/useGet';
import { HubError } from '../../../common/HubError';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';

export function RepositoryVersionPage() {
  const params = useParams<{ id: string; version: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;

  const repository = data?.results.length > 0 ? data?.results[0] : undefined;
  const repo_id: string = parsePulpIDFromURL(repository?.pulp_href) || '';
  return (
    <>
      <PageLayout>
        <PageHeader
          title={t(`Version: ${params.version}`)}
          breadcrumbs={[
            { label: t('Repositories'), to: getPageUrl(HubRoute.Repositories) },
            { label: params.id, to: getPageUrl(HubRoute.RepositoryPage, { params: params }) },
            {
              label: t('Versions'),
              to: getPageUrl(HubRoute.RepositoryVersions, { params: params }),
            },
            { label: params.version },
          ]}
        />
        <PageRoutedTabs
          backTab={{
            label: t('Back to Versions'),
            page: HubRoute.RepositoryVersions,
            persistentFilterKey: '',
          }}
          tabs={[
            {
              label: t('Details'),
              page: HubRoute.RepositoryVersionDetails,
            },
            {
              label: t('Collections'),
              page: HubRoute.RepositoryVersionCollections,
            },
          ]}
          params={{ id: params.id, version: params.version }}
          componentParams={{ repo_id, repository: repository }}
        />
      </PageLayout>
    </>
  );
}
