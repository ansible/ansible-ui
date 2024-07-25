import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaRoleExpandedRow } from './components/EdaRoleExpandedRow';
import { useEdaView } from '../../common/useEventDrivenView';
import { useEdaRoleRowActions, useEdaRoleToolbarActions } from './hooks/useEdaRoleActions';
import { useRoleColumns } from './hooks/useRoleColumns';
import { useRoleFilters } from './hooks/useRoleFilters';

export function EdaRoles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        titleHelpTitle={t('Roles')}
        titleHelp={t(
          'A role represents a set of actions that a team or user may perform on a resource or set of resources.'
        )}
        description={t(
          'A role represents a set of actions that a team or user may perform on a resource or set of resources.'
        )}
      />
      <EdaRolesTable />
    </PageLayout>
  );
}

export function EdaRolesTable() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns();
  const toolbarFilters = useRoleFilters();

  const view = useEdaView<EdaRbacRole>({
    url: edaAPI`/role_definitions/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useEdaRoleToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useEdaRoleRowActions(view.unselectItemsAndRefresh);

  return (
    <PageTable
      id="eda-roles-table"
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      toolbarFilters={toolbarFilters}
      expandedRow={(role) => <EdaRoleExpandedRow role={role} />}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={t('There are currently no roles added for your organization.')}
      {...view}
      defaultSubtitle={t('Role')}
    />
  );
}
