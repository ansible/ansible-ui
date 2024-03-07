import { useTranslation } from 'react-i18next';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PFColorE,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubRoute } from '../../../main/HubRoutes';
import { Task } from '../../tasks/Task';
import { Repository } from '../Repository';
import { RepositoryLabels } from '../components/RepositoryLabels';

export function RepositoryDetails() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { repository } = useOutletContext<{ repository: Repository }>();

  const { data: distroData, error: distroError } = useGet<{
    results: { name: string; client_url: string }[];
  }>(params.id ? pulpAPI`/distributions/ansible/ansible/?name=${params.id}` : '');

  const repoURL = repository.remote
    ? pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(repository.remote)}/`
    : '';
  const { data: remoteData, error: remoteError } = useGet<Task>(repoURL);

  if ((!distroData && !distroError) || (!remoteData && !remoteError && repository.remote))
    return <LoadingPage breadcrumbs tabs />;

  const distribution: { name: string; client_url: string } | undefined = distroData?.results[0];

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{params.id}</PageDetail>
      <PageDetail label={t('Description')}>{repository.description || t('None')}</PageDetail>
      <PageDetail label={t('Retained version count')}>{repository.retain_repo_versions}</PageDetail>
      <PageDetail label={t('Distribution')}>
        {distroError ? (
          <span style={{ color: PFColorE.Red }}>{t('Error loading distribution')}</span>
        ) : (
          <>{distribution?.name || t('None')}</>
        )}
      </PageDetail>
      <PageDetail label={t('Repository URL')}>
        {distribution?.client_url ? <CopyCell text={distribution.client_url} /> : t('None')}
      </PageDetail>
      <PageDetail label={t('Labels')}>
        <RepositoryLabels repository={repository} />
      </PageDetail>
      <PageDetail label={t('Private')}>{repository.private ? t('yes') : t('no')}</PageDetail>
      <PageDetail label={t('Remote')}>
        {repository.remote && !remoteError ? (
          <Link to={getPageUrl(HubRoute.RemotePage, { params: { id: remoteData?.name } })}>
            {remoteData?.name}
          </Link>
        ) : (
          <>
            {remoteError ? (
              <span style={{ color: PFColorE.Red }}>{t('Error loading remote')}</span>
            ) : (
              t('None')
            )}
          </>
        )}
      </PageDetail>
    </PageDetails>
  );
}
