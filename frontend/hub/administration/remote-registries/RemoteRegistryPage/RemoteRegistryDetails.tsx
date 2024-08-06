import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  CopyCell,
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  TextCell,
} from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { useGet } from '../../../../common/crud/useGet';
import { HubError } from '../../../common/HubError';
import { hubAPI } from '../../../common/api/formatPath';
import { HubItemsResponse } from '../../../common/useHubView';
import { RemoteRegistry } from '../RemoteRegistry';

export function RemoteRegistryDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
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
    <PageDetails>
      <PageDetail label={t('Name')}>{remoteRegistry?.name}</PageDetail>
      <PageDetail label={t('URL')}>
        <CopyCell text={remoteRegistry?.url} />
      </PageDetail>
      <PageDetail label={t('Sync status')}>
        {Object.keys(remoteRegistry?.last_sync_task).length > 0 ? (
          <StatusCell status={remoteRegistry?.last_sync_task.state} />
        ) : (
          <TextCell text={t('Never synced')} />
        )}
      </PageDetail>
      {remoteRegistry?.last_sync_task?.finished_at ? (
        <PageDetail label={t('Last sync')}>
          {<DateTimeCell value={remoteRegistry?.last_sync_task?.finished_at} />}
        </PageDetail>
      ) : null}
      {remoteRegistry?.proxy_url ? (
        <PageDetail label={t('Proxy URL')}>
          <CopyCell text={remoteRegistry?.proxy_url} />
        </PageDetail>
      ) : null}
      <PageDetail label={t('TLS validation')}>
        {remoteRegistry?.tls_validation ? t('Enabled') : t('Disabled')}
      </PageDetail>
      <PageDetail label={t('Client certificate')}>
        {remoteRegistry?.client_cert ?? t('None')}
      </PageDetail>
      <PageDetail label={t('CA certificate')}>{remoteRegistry?.ca_cert ?? t('None')}</PageDetail>
      <PageDetail label={t('Download concurrency')}>
        {remoteRegistry?.download_concurrency?.toString() ?? t('None')}
      </PageDetail>
      <PageDetail label={t('Rate limit')}>{remoteRegistry?.rate_limit ?? t('None')}</PageDetail>
    </PageDetails>
  );
}
