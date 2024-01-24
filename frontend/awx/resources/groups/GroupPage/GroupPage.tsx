import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxGroup } from '../../../interfaces/AwxGroup';
import { awxAPI } from '../../../common/api/awx-utils';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { AwxError } from '../../../common/AwxError';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';

export function GroupPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: group, refresh } = useGetItem<AwxGroup>(awxAPI`/groups`, params.id);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!group) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={group?.name}
        breadcrumbs={[
          { label: t('Groups'), to: getPageUrl(AwxRoute.Groups) },
          { label: group?.name },
        ]}
        headerActions={[]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Groups'),
          page: AwxRoute.Groups,
          persistentFilterKey: 'groups',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.GroupDetails },
          { label: t('Related Groups'), page: AwxRoute.GroupRelatedGroups },
          { label: t('Hosts'), page: AwxRoute.GroupHosts },
        ]}
        params={{ id: group.id }}
      />
    </PageLayout>
  );
}
