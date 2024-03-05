/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { AwxError } from '../../../common/AwxError';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useHostsActions } from '../hooks/useHostsActions';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useGetHost } from '../hooks/useGetHost';

export function HostPage() {
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
            actions={itemActions}
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
