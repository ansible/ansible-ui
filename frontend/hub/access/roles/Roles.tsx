import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useRoleColumns } from './hooks/useRoleColumns';
import { usePulpView } from '../../usePulpView';
import { Role } from './Role';
import { pulpAPI } from '../../api/formatPath';
import { nameKeyFn } from '../../../common/utils/nameKeyFn';
import { useHubContext } from '../../useHubContext';
import { useRoleRowActions, useRoleToolbarActions } from './hooks/useRoleActions';
import { RoleExpandedRow } from './components/RoleExpandedRow';
import { useRoleFilters } from './hooks/useRoleFilters';

export function Roles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader title={t('Roles')} />
      <HubRolesTable />
    </PageLayout>
  );
}

export function HubRolesTable() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns();
  const { user } = useHubContext();
  const toolbarActions = useRoleToolbarActions();
  const rowActions = useRoleRowActions();
  const roleFilters = useRoleFilters();

  const view = usePulpView<Role>({
    url: pulpAPI`/roles/`,
    keyFn: nameKeyFn,
    tableColumns,
    queryParams: {
      ordering: 'name',
      name__startswith: 'galaxy',
    },
  });
  return (
    <PageTable
      id="hub-roles-table"
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      toolbarFilters={roleFilters}
      expandedRow={(role) => <RoleExpandedRow role={role} />}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={
        user && !user.is_anonymous
          ? t('There are currently no roles.')
          : t('You do not have permission to create a role.')
      }
      emptyStateDescription={
        user && !user.is_anonymous
          ? t('Please add a role by using the button below.')
          : t('You do not have permission to create a role.')
      }
      {...view}
      defaultSubtitle={t('Roles')}
    />
  );
}
