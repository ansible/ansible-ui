import { Label, LabelGroup } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  CopyCell,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { pulpAPI } from '../../common/api/formatPath';
import { PulpItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { Repository } from '../repositories/Repository';
import { HubRemote } from './Remotes';
import { useRemoteActions } from './hooks/useRemoteActions';

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

export function RemoteDetails() {
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

  const emptyRequirementFieldValue = '---';
  const requirementsFileValue = remote?.requirements_file ?? emptyRequirementFieldValue;

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
        <PageDetails>
          <PageDetail label={t('Name')}>{remote?.name}</PageDetail>
          <PageDetail label={t('URL')}>
            <CopyCell text={remote?.url} />
          </PageDetail>
          {remote?.proxy_url ? (
            <PageDetail label={t('Proxy URL')}>
              <CopyCell text={remote?.proxy_url} />
            </PageDetail>
          ) : null}
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
          <PageDetail label={t('Include all dependencies when syncing a collection')}>
            {remote?.sync_dependencies ? t('True') : t('False')}
          </PageDetail>
          <PageDetail label={t('Download only signed collections')}>
            {remote?.signed_only ? t('True') : t('False')}
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
        <PageDetails numberOfColumns="single">
          <PageDetailCodeEditor
            label={t('YAML requirements')}
            value={requirementsFileValue}
            showCopyToClipboard={requirementsFileValue !== emptyRequirementFieldValue}
          />
        </PageDetails>
      </PageLayout>
    </>
  );
}
