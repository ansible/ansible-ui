import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaGroup } from '../../interfaces/EdaGroup';
import { useGroupActions } from './hooks/useGroupActions';
import { useGroupColumns } from './hooks/useGroupColumns';
import { useGroupFilters } from './hooks/useGroupFilters';
import { useGroupsActions } from './hooks/useGroupsActions';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function Groups() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading groups')}
        emptyStateTitle={t('No groups yet')}
        emptyStateDescription={t('To get started, create a group.')}
        emptyStateButtonText={t('Create group')}
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaGroup)}
        {...view}
        defaultSubtitle={t('Group')}
      />
    </PageLayout>
  );
}
