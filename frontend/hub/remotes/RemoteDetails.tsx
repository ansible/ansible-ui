import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetail, PageDetails, PageHeader, PageLayout } from '../../../framework';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { AwxError } from '../../awx/common/AwxError';
import { RouteObj } from '../../common/Routes';
import { useGet } from '../../common/crud/useGet';
import { pulpAPI } from '../api/utils';
import { Repository } from '../repositories/Repository';
import { PulpItemsResponse } from '../usePulpView';
import { IRemotes } from './Remotes';

function useErrorHandlerAndLoading<T>(
  data: T | undefined,
  error: Error | undefined,
  refresh?: () => void
) {
  if (error) {
    return <AwxError error={error} handleRefresh={refresh} />;
  }

  if (!data) {
    return <LoadingPage breadcrumbs tabs />;
  }

  return null;
}

export function RemoteDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: remotesData,
    error: errorRemotes,
    refresh: refreshRemotes,
  } = useGet<PulpItemsResponse<IRemotes>>(
    pulpAPI`/remotes/ansible/collection/?name=${params.id || ''}`
  );
  const remote = remotesData?.results?.[0];
  const remoteHref = remote?.pulp_href;

  const repositoryQuery = remoteHref
    ? pulpAPI`/repositories/ansible/ansible/?remote=${encodeURI(remoteHref)}`
    : undefined;

  const {
    data: repositories,
    error: errorRepositories,
    refresh: refreshRepositories,
  } = useGet<PulpItemsResponse<Repository>>(repositoryQuery);

  const loadingOrErrorRemotes = useErrorHandlerAndLoading(remote, errorRemotes, refreshRemotes);
  const loadingOrErrorRepositories = useErrorHandlerAndLoading(
    repositories,
    errorRepositories,
    refreshRepositories
  );

  if (loadingOrErrorRemotes) return loadingOrErrorRemotes;
  if (loadingOrErrorRepositories) return loadingOrErrorRepositories;

  return (
    <>
      <PageLayout>
        <PageHeader
          title={remote?.name}
          breadcrumbs={[{ label: t('Remotes'), to: RouteObj.Remotes }, { label: remote?.name }]}
        />
        <PageDetails>
          <PageDetail label={t('Name')}>{remote?.name}</PageDetail>
          <PageDetail label={t('URL')}>{remote?.url}</PageDetail>
          <PageDetail label={t('Proxy URL')}>{remote?.proxy_url}</PageDetail>
          <PageDetail label={t('TLS validation')}>
            {remote?.tls_validation ? t('Enabled') : t('Disabled')}
          </PageDetail>
          <PageDetail label={t('Client certificate')}>
            {remote?.client_cert ?? t('None')}
          </PageDetail>
          <PageDetail label={t('CA certificate')}>{remote?.ca_cert ?? t('None')}</PageDetail>
          <PageDetail label={t('Download concurrency')}>
            {remote?.download_concurrency?.toString() ?? t('None')}
          </PageDetail>
          <PageDetail label={t('Rate limit')}>
            {remote?.rate_limit?.toString() ?? t('None')}
          </PageDetail>

          <PageDetail label={t('Repositories')}>
            {repositories?.results?.length ? (
              <LabelGroup
                numLabels={3}
                expandedText={t('Show less')}
                collapsedText={t(`{{count}} more`, {
                  count: repositories.count - 3,
                })}
              >
                {repositories.results.map((repository) => (
                  <Label key={repository.name}>{repository.name}</Label>
                ))}
              </LabelGroup>
            ) : (
              t('---')
            )}
          </PageDetail>
        </PageDetails>
      </PageLayout>
    </>
  );
}
