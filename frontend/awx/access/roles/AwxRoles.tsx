import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  ToolbarFilterType,
  useInMemoryView,
} from '../../../../framework';
import { PageSelectOption } from '../../../../framework/PageInputs/PageSelectOption';
import { useAwxRoles } from './useAwxRoles';

interface AwxRole {
  id: string;
  resource: string;
  name: string;
  description: string;
}

export function AwxRoles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
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
          id: resourceTypeId + '-' + roleId,
          resource: resourceType.name,
          name: role.label,
          description: role.description,
        });
      }
    }
    return roles;
  }, [awxRoles]);

  const tableColumns = useMemo(() => {
    const columns: ITableColumn<AwxRole>[] = [
      {
        id: 'name',
        type: 'text',
        header: t('Role'),
        value: (role: AwxRole) => role.name,
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        id: 'resource',
        type: 'text',
        header: t('Resource'),
        value: (role: AwxRole) => role.resource,
        sort: 'resource',
        defaultSort: true,
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        id: 'description',
        type: 'text',
        header: t('Description'),
        value: (role: AwxRole) => role.description,
        card: 'description',
        list: 'description',
      },
    ];
    return columns;
  }, [t]);

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
      },
    ];
    return filters;
  }, [roles, t]);

  const view = useInMemoryView<AwxRole>({
    keyFn: (role) => role.id,
    items: roles,
    tableColumns,
    toolbarFilters,
  });

  return (
    <PageTable<AwxRole>
      {...view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      errorStateTitle="NEVER"
      emptyStateTitle="NEVER"
      defaultSubtitle={t('Role')}
    />
  );
}
