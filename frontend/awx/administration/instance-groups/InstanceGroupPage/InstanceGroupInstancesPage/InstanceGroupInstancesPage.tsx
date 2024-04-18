import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageLayout, PageHeader } from '../../../../../../framework';
import { PageRoutedTabs } from '../../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../../common/crud/useGet';
import { AwxError } from '../../../../common/AwxError';
import { awxAPI } from '../../../../common/api/awx-utils';
import { Instance } from '../../../../interfaces/Instance';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function InstanceGroupInstancesPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; instance_id: string }>();
  const {
    error,
    data: instance,
    refresh,
  } = useGetItem<Instance>(awxAPI`/instances`, params.instance_id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instance) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader title={instance?.hostname} />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Instances'),
          page: AwxRoute.InstanceGroupInstances,
          persistentFilterKey: 'instances',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.InstanceGroupInstanceDetails }]}
        params={{ id: params.id, instance_id: instance.id }}
      />
    </PageLayout>
  );
}
