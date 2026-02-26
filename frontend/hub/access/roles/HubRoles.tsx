import { PageHeader, PageLayout, PageTable } from '@ansible/ansible-ui-framework';
import { Alert } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../../common/api/formatPath';
import { filterInsightsBulkActions } from '../../common/isInsights';
import { useHubActiveUser } from '../../common/useHubActiveUser';
import { useHubView } from '../../common/useHubView';
import { HubRbacRole } from '../../interfaces/expanded/HubRbacRole';
import { HubRoleExpandedRow } from './components/HubRoleExpandedRow';
import { useRoleRowActions, useRoleToolbarActions } from './hooks/useRoleActions';
import { useRoleColumns } from './hooks/useRoleColumns';
import { useRoleFilters } from './hooks/useRoleFilters';

export function HubRoles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents a set of actions that a team or user may perform on a resource or set of resources.'
        )}
      />
      <Alert
        variant="info"
        title={t('Roles can be assigned to teams and users from the teams and users pages.')}
        isInline
      />
      <HubRolesTable />;
    </PageLayout>
  );
}

function roleKeyFn(role: HubRbacRole) {
  return role.id;
}

export function HubRolesTable() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns();
  const { activeHubUser: user } = useHubActiveUser();
  const toolbarFilters = useRoleFilters();

  const view = useHubView<HubRbacRole>({
    url: hubAPI`/_ui/v2/role_definitions/`,
    toolbarFilters,
    tableColumns,
    keyFn: roleKeyFn,
    defaultFilters: {
      type: ['galaxy.'],
    },
  });

  const allToolbarActions = useRoleToolbarActions(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );
  const rowActions = useRoleRowActions(view.unselectItemsAndRefresh);

  return (
    <PageTable
      id="hub-roles-table"
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      toolbarFilters={toolbarFilters}
      expandedRow={(role) => <HubRoleExpandedRow role={role} />}
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
