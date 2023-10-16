/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { AwxHost } from '../../../interfaces/AwxHost';

export function HostPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: host, refresh } = useGetItem<AwxHost>('/api/v2/hosts', params.id);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!host) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={host?.name}
        breadcrumbs={[{ label: t('Hosts'), to: getPageUrl(AwxRoute.Hosts) }, { label: host?.name }]}
        headerActions={[]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Hosts'),
          page: AwxRoute.Hosts,
          persistentFilterKey: 'hosts',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.HostDetails },
          { label: t('Facts'), page: AwxRoute.HostFacts },
          { label: t('Groups'), page: AwxRoute.HostGroups },
          { label: t('Jobs'), page: AwxRoute.HostJobs },
        ]}
        params={{ id: host.id }}
      />
    </PageLayout>
  );
}
