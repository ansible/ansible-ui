/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { AwxError } from '../../../common/AwxError';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetHost } from '../hooks/useGetHost';
import { useHostsActions } from '../hooks/useHostsActions';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';

export function HostPage() {
  const activityStream = useViewActivityStream();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const { host, refresh, error } = useGetHost(params.id as string);

  const getPageUrl = useGetPageUrl();

  const itemActions = useHostsActions((_host) => {
    pageNavigate(AwxRoute.Hosts, {
      params: { id: params.id },
    });
  }, refresh);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!host) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={host?.name}
        breadcrumbs={[{ label: t('Hosts'), to: getPageUrl(AwxRoute.Hosts) }, { label: host?.name }]}
        headerActions={
          <PageActions<AwxHost>
            actions={[...activityStream, ...itemActions]}
            position={DropdownPosition.right}
            selectedItem={host}
          />
        }
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
