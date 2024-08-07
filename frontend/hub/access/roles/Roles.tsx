import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { pulpAPI } from '../../common/api/formatPath';
import { useHubContext } from '../../common/useHubContext';
import { useHubView } from '../../common/useHubView';
import { Role } from './Role';
import { RoleExpandedRow } from './components/RoleExpandedRow';
import { useRoleRowActions, useRoleToolbarActions } from './hooks/useRoleActions';
import { useRoleColumns } from './hooks/useRoleColumns';
import { useRoleFilters } from './hooks/useRoleFilters';

export function Roles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
        titleHelpTitle={t('Roles')}
        titleHelp={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
      />
      <HubRolesTable />
    </PageLayout>
  );
}

function roleKeyFn(role: { pulp_href: string }) {
  return role.pulp_href;
}

export function HubRolesTable() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns();
  const { user } = useHubContext();
  const toolbarFilters = useRoleFilters();

  const view = useHubView<Role>({
    url: pulpAPI`/roles/`,
    keyFn: roleKeyFn,
    toolbarFilters,
    tableColumns,
    queryParams: {
      ordering: 'name',
    },
    defaultFilters: {
      type: ['galaxy.'],
    },
  });

  const toolbarActions = useRoleToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useRoleRowActions(view.unselectItemsAndRefresh);

  return (
    <PageTable
      id="hub-roles-table"
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      toolbarFilters={toolbarFilters}
      expandedRow={(role) => <RoleExpandedRow role={role} showCustom={true} />}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={
        user && !user.is_anonymous && user.is_superuser
          ? t('There are currently no roles.')
          : t('You do not have permission to create a role.')
      }
      emptyStateDescription={
        user && !user.is_anonymous && user.is_superuser
          ? t('Please add a role by using the button below.')
          : t('You do not have permission to create a role.')
      }
      emptyStateIcon={user && !user.is_anonymous && user.is_superuser ? undefined : CubesIcon}
      emptyStateActions={
        user && !user.is_anonymous && user.is_superuser ? toolbarActions.slice(0, 1) : undefined
      }
      {...view}
      defaultSubtitle={t('Roles')}
    />
  );
}
