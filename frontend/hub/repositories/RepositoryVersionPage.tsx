import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../framework';
import { HubRoute } from '../HubRoutes';
import { PageRoutedTabs } from '../../../framework/PageTabs/PageRoutedTabs';
import { useParams /*useLocation*/ } from 'react-router-dom';
import { useGet } from '../../common/crud/useGet';
import { PulpItemsResponse } from '../usePulpView';
import { Repository } from './Repository';
import { pulpAPI } from '../api/formatPath';
import { parsePulpIDFromURL } from '../api/utils';
import { HubError } from '../common/HubError';
import { useTranslation } from 'react-i18next';

export function RepositoryVersionPage() {
  const params = useParams<{ id: string; version: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;
  // const location = useLocation();
  // console.log(location);

  const repository = data?.results.length > 0 ? data?.results[0] : undefined;
  const repo_id: string = parsePulpIDFromURL(repository ? repository.pulp_href : '') || '';
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
