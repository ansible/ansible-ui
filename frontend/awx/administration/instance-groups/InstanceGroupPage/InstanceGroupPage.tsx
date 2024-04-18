import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useTranslation } from 'react-i18next';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';

export function InstanceGroupPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: instanceGroup,
    refresh,
  } = useGetItem<Instance>(awxAPI`/instance_groups`, params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instanceGroup) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader title={instanceGroup?.name} />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Instance Groups'),
          page: AwxRoute.InstanceGroups,
          persistentFilterKey: 'instance_groups',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InstanceGroupDetails },
          { label: t('Instances'), page: AwxRoute.InstanceGroupInstances },
          { label: t('Jobs'), page: AwxRoute.InstanceGroupJobs },
        ]}
        params={{ id: instanceGroup.id }}
      />
    </PageLayout>
  );
}
