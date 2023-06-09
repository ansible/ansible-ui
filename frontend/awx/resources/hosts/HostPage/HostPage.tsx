/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxError } from '../../../common/AwxError';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';

export function HostPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: host, refresh } = useGetItem<AwxHost>('/api/v2/hosts', params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!host) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={host?.name}
        breadcrumbs={[{ label: t('Hosts'), to: RouteObj.Hosts }, { label: host?.name }]}
        headerActions={[]}
      />
      <RoutedTabs isLoading={!host} baseUrl={RouteObj.HostPage}>
        <PageBackTab label={t('Back to Hosts')} url={RouteObj.Hosts} persistentFilterKey="hosts" />
        <RoutedTab label={t('Details')} url={RouteObj.HostDetails}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Facts')} url={RouteObj.HostFacts}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Groups')} url={RouteObj.HostGroups}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Jobs')} url={RouteObj.HostJobs}>
          <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
