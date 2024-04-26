import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageLayout,
  PageHeader,
  PageActions,
  useGetPageUrl,
} from '../../../../../../framework';
import { PageRoutedTabs } from '../../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../../common/crud/useGet';
import { AwxError } from '../../../../common/AwxError';
import { awxAPI } from '../../../../common/api/awx-utils';
import { Instance } from '../../../../interfaces/Instance';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { useIGInstanceRowActions } from '../hooks/useIGInstanceRowActions';
import { DropdownPosition } from '@patternfly/react-core/deprecated';

export function InstanceGroupInstancesPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; instance_id: string }>();
  const {
    error,
    data: instance,
    refresh,
  } = useGetItem<Instance>(awxAPI`/instances`, params.instance_id);

  const { data: instanceGroup } = useGetItem<Instance>(awxAPI`/instance_groups`, params.id);

  const itemActions = useIGInstanceRowActions(refresh);
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instance) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={instance?.hostname}
        breadcrumbs={[
          {
            label: t('Instance groups'),
            to: getPageUrl(AwxRoute.InstanceGroups),
          },
          {
            label: instanceGroup?.name,
          },
          {
            label: t('Instances'),
            to: getPageUrl(AwxRoute.InstanceGroupInstances, { params: params }),
          },
          {
            label: t(instance?.hostname),
          },
        ]}
        headerActions={
          <PageActions
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={instance}
          />
        }
      />
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
