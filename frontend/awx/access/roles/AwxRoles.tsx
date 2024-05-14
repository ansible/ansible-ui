import { Alert } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  ToolbarFilterType,
} from '../../../../framework';
import { useAwxView } from '../../common/useAwxView';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxRoleColumns } from './useAwxRoleColumns';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';

export function AwxRoles() {
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
        className="border-bottom"
      />
      <AwxRolesTable />;
    </PageLayout>
  );
}

export function AwxRolesTable() {
  const { t } = useTranslation();

  const tableColumns = useAwxRoleColumns();

  const toolbarFilters = useMemo(() => {
    const filters: IToolbarFilter[] = [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__startswith',
        comparison: 'startsWith',
      },
      {
        key: 'editable',
        label: t('Editable'),
        type: ToolbarFilterType.SingleSelect,
        query: 'managed',
        options: [
          { label: t('Editable'), value: 'false' },
          { label: t('Built-in'), value: 'true' },
        ],
        placeholder: t('Filter by editability'),
      },
    ];
    return filters;
  }, [t]);

  const view = useAwxView<AwxRbacRole>({
    url: awxAPI`/role_definitions/`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageTable<AwxRbacRole>
      {...view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={t('No roles found')}
      defaultSubtitle={t('Role')}
    />
  );
}
