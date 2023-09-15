import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX } from '../../constants';
import { EdaGroup } from '../../interfaces/EdaGroup';
import { useEdaView } from '../../useEventDrivenView';
import { useGroupActions } from './hooks/useGroupActions';
import { useGroupColumns } from './hooks/useGroupColumns';
import { useGroupFilters } from './hooks/useGroupFilters';
import { useGroupsActions } from './hooks/useGroupsActions';

export function Groups() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useGroupFilters();
  const tableColumns = useGroupColumns();
  const view = useEdaView<EdaGroup>({
    url: `${API_PREFIX}/groups/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useGroupsActions(view);
  const rowActions = useGroupActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Groups')} />
      <PageTable
        id="eda-groups-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading groups')}
        emptyStateTitle={t('No groups yet')}
        emptyStateDescription={t('To get started, create a group.')}
        emptyStateButtonText={t('Create group')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateGroup)}
        {...view}
        defaultSubtitle={t('Group')}
      />
    </PageLayout>
  );
}
