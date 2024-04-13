import { Alert } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  ToolbarFilterType,
  useInMemoryView,
} from '../../../../framework';
import { PageSelectOption } from '../../../../framework/PageInputs/PageSelectOption';
import { useAwxRoleColumns } from './useAwxRoleColumns';
import { useAwxRoles } from './useAwxRoles';

export interface AwxRole {
  id: string;
  resourceId: string;
  resource: string;
  roleId: string;
  name: string;
  description: string;
}

function roleKeyFn(role: AwxRole) {
  return role.id;
}

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
  const awxRoles = useAwxRoles();
  const roles = useMemo(() => {
    const roles: AwxRole[] = [];
    for (const resourceTypeId of Object.keys(awxRoles)) {
      const resourceType = awxRoles[resourceTypeId];
      for (const roleId of Object.keys(resourceType.roles)) {
        const role = resourceType.roles[roleId];
        roles.push({
          id: roleId + '-' + resourceTypeId,
          roleId: roleId,
          name: role.label,
          resourceId: resourceTypeId,
          resource: resourceType.name,
          description: role.description,
        });
      }
    }
    return roles;
  }, [awxRoles]);

  const tableColumns = useAwxRoleColumns();

  const toolbarFilters = useMemo(() => {
    const filters: IToolbarFilter[] = [
      {
        type: ToolbarFilterType.MultiSelect,
        label: t('Role'),
        key: 'name',
        query: 'name',
        options: roles.reduce<PageSelectOption<string>[]>((options, role) => {
          if (!options.find((option) => option.label === role.name)) {
            options.push({ label: role.name, value: role.name });
          }
          return options;
        }, []),
        placeholder: t('Filter by role'),
        isPinned: true,
      },
      {
        type: ToolbarFilterType.MultiSelect,
        label: t('Resource'),
        key: 'resource',
        query: 'resource',
        options: roles.reduce<PageSelectOption<string>[]>((options, role) => {
          if (!options.find((option) => option.label === role.resource)) {
            options.push({ label: role.resource, value: role.resource });
          }
          return options;
        }, []),
        placeholder: t('Filter by resource'),
        isPinned: true,
      },
    ];
    return filters;
  }, [roles, t]);

  const view = useInMemoryView<AwxRole>({
    keyFn: roleKeyFn,
    items: roles,
    tableColumns,
    toolbarFilters,
  });

  return (
    <PageTable<AwxRole>
      {...view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={t('No roles found')}
      defaultSubtitle={t('Role')}
    />
  );
}
