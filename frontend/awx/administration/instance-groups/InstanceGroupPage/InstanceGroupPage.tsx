import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInstanceGroupRowActions } from '../hooks/useInstanceGroupActions';

export function InstanceGroupPage() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: instanceGroup,
    refresh,
  } = useGetItem<InstanceGroup>(awxAPI`/instance_groups`, params.id);

  const itemActions = useInstanceGroupRowActions(() => pageNavigate(AwxRoute.InstanceGroups));
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instanceGroup) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={instanceGroup?.name}
        breadcrumbs={[
          {
            label: t('Instance groups'),
            to: getPageUrl(AwxRoute.InstanceGroups),
          },
          {
            label: instanceGroup?.name,
          },
        ]}
        headerActions={
          <PageActions
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={instanceGroup}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Instance Groups'),
          page: AwxRoute.InstanceGroups,
          persistentFilterKey: 'instance_groups',
        }}
        tabs={
          instanceGroup?.is_container_group
            ? [
                { label: t('Details'), page: AwxRoute.InstanceGroupDetails },
                { label: t('Team access'), page: AwxRoute.InstanceGroupTeamAccess },
                { label: t('User access'), page: AwxRoute.InstanceGroupUserAccess },
                { label: t('Jobs'), page: AwxRoute.InstanceGroupJobs },
              ]
            : [
                { label: t('Details'), page: AwxRoute.InstanceGroupDetails },
                { label: t('Instances'), page: AwxRoute.InstanceGroupInstances },
                { label: t('Team access'), page: AwxRoute.InstanceGroupTeamAccess },
                { label: t('User access'), page: AwxRoute.InstanceGroupUserAccess },
                { label: t('Jobs'), page: AwxRoute.InstanceGroupJobs },
              ]
        }
        params={{ id: instanceGroup.id }}
      />
    </PageLayout>
  );
}
