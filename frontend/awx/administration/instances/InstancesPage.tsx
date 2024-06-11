import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { useGet, useGetItem } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance } from '../../interfaces/Instance';
import { Settings } from '../../interfaces/Settings';
import { AwxRoute } from '../../main/AwxRoutes';
import { useInstanceDetailsActions } from './hooks/useInstanceActions';
import { useViewActivityStream } from '../../access/common/useViewActivityStream';

export function InstancePage() {
  const { t } = useTranslation();
  const activityStream = useViewActivityStream();
  const params = useParams<{ id: string }>();
  const { error, data: instance, refresh } = useGetItem<Instance>(awxAPI`/instances`, params.id);
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = !data?.IS_K8S;
  const itemActions = useInstanceDetailsActions();
  const pageActions = [...itemActions];
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instance) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={instance?.hostname}
        breadcrumbs={[
          { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
          { label: instance?.hostname },
        ]}
        headerActions={
          <PageActions<Instance>
            actions={[...activityStream, ...pageActions]}
            position={DropdownPosition.right}
            selectedItem={instance}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Instances'),
          page: AwxRoute.Instances,
          persistentFilterKey: 'instances',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InstanceDetails, dataCy: 'instances-details-tab' },
          !isK8s && {
            label: t('Listener Addresses'),
            page: AwxRoute.InstanceListenerAddresses,
            dataCy: 'instances-listener-addresses-tab',
          },
          !isK8s && {
            label: t('Peers'),
            page: AwxRoute.InstancePeers,
            dataCy: 'instances-peers-tab',
          },
        ]}
        params={{ id: instance.id }}
      />
    </PageLayout>
  );
}
