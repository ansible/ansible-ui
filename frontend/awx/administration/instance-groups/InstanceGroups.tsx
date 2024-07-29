import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import {
  useDisableCreateInstanceGroup,
  useInstanceGroupRowActions,
  useInstanceGroupToolbarActions,
} from './hooks/useInstanceGroupActions';
import { useInstanceGroupsColumns } from './hooks/useInstanceGroupColumns';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { useDynamicToolbarFilters } from '../../common/useDynamicFilters';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';

export function InstanceGroups() {
  const { t } = useTranslation();
  const toolbarFilters = useInstanceGroupsFilters();
  const tableColumns = useInstanceGroupsColumns();
  const view = useAwxView({
    url: awxAPI`/instance_groups/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInstanceGroupToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useInstanceGroupRowActions(view.unselectItemsAndRefresh);
  const isCreateActionDisabled = useDisableCreateInstanceGroup();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Instance Groups')}
        titleHelpTitle={t('Instance Groups')}
        titleHelp={t(
          'An instance group provides the ability to group instances in a clustered environment. It defines grouped instances or grouped containers.'
        )}
        description={t(
          'An instance group provides the ability to group instances in a clustered environment.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/instance_groups.html`}
        headerActions={<ActivityStreamIcon type={'instance_group'} />}
      />
      <PageTable<InstanceGroup>
        id="awx-instance-groups-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading instance groups')}
        emptyStateTitle={
          isCreateActionDisabled
            ? t('You do not have permission to create an instance group.')
            : t('No instance groups yet')
        }
        emptyStateDescription={
          isCreateActionDisabled
            ? t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
            : t('Please create an instance group by using the button below.')
        }
        emptyStateIcon={isCreateActionDisabled ? CubesIcon : undefined}
        emptyStateActions={isCreateActionDisabled ? undefined : toolbarActions.slice(0, 1)}
        {...view}
        defaultSubtitle={t('Instance Group')}
      />
    </PageLayout>
  );
}

export function useInstanceGroupsFilters() {
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'instance_groups',
    preSortedKeys: ['name', 'id'],
    preFilledValueKeys: {
      name: { apiPath: 'instance_groups' },
      id: { apiPath: 'instance_groups' },
    },
  });
  return toolbarFilters;
}
