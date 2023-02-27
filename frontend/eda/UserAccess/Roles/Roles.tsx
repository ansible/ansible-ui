import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaRole } from '../../interfaces/EdaRole';
import { useRoleActions } from './hooks/useRoleActions';
import { useRoleColumns } from './hooks/useRoleColumns';
import { useRoleFilters } from './hooks/useRoleFilters';
import { useRolesActions } from './hooks/useRolesActions';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function Roles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useRoleFilters();
  const tableColumns = useRoleColumns();
  const view = useEdaView<EdaRole>({
    url: `${API_PREFIX}/projects/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRolesActions(view);
  const rowActions = useRoleActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Roles')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={t('No roles yet')}
        emptyStateDescription={t('To get started, create a role.')}
        emptyStateButtonText={t('Create role')}
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaRole)}
        {...view}
        defaultSubtitle={t('Role')}
      />
    </PageLayout>
  );
}
