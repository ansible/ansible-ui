import { useParams, Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { Task } from '../../tasks/Task';
import { pulpAPI } from '../../api/formatPath';
import { RepositoryLabels } from '../components/RepositoryLabels';
import { HubRoute } from '../../HubRoutes';
import { Repository } from '../Repository';
import { parsePulpIDFromURL } from '../../api/utils';
import { HubError } from '../../common/HubError';

export function RepositoryDetails() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { repository } = useOutletContext<{ repository: Repository }>();

  const {
    data: distroData,
    error: distroError,
    refresh,
  } = useGet<{ results: { name: string; client_url: string }[] }>(
    params.id ? pulpAPI`/distributions/ansible/ansible/?name=${params.id}` : ''
  );
  const { data: remoteData, error: remoteError } = useGet<Task>(
    params.id
      ? pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(repository.remote || '') || ''}`
      : ''
  );

  if (distroError || remoteError)
    return <HubError error={distroError || remoteError} handleRefresh={refresh} />;
  if (!distroData || !remoteData) return <LoadingPage breadcrumbs tabs />;
  const distribution: { name: string; client_url: string } = distroData?.results[0];

  return (
    <PageDetails>
      <PageDetail label={t('Repository name')}>{params.id}</PageDetail>
      <PageDetail label={t('Description')}>{repository.description || t('None')}</PageDetail>
      <PageDetail label={t('Retained version count')}>{repository.retain_repo_versions}</PageDetail>
      <PageDetail label={t('Distribution')}>{distribution.name}</PageDetail>
      <PageDetail label={t('Repository URL')}>
        <CopyCell text={distribution.client_url} />
      </PageDetail>
      <PageDetail label={t('Labels')}>
        <RepositoryLabels repository={repository} />
      </PageDetail>
      <PageDetail label={t('Private')}>{repository.private ? t('yes') : t('no')}</PageDetail>
      <PageDetail label={t('Remote')}>
        {repository.remote ? (
          <Link to={getPageUrl(HubRoute.RemotePage, { params: { id: remoteData.name } })}>
            {remoteData.name}
          </Link>
        ) : (
          t('None')
        )}
      </PageDetail>
    </PageDetails>
  );
}
