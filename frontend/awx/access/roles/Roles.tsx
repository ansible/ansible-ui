import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { Role } from '../../interfaces/Role';
import { IRoles, useRolesMetadata } from './useRoleMetadata';

export function useRolesFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'role',
        label: t('Role'),
        type: 'string',
        query: 'role_field__icontains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}

export function useRolesColumns() {
  const { t } = useTranslation();
  const rolesMetadata = useRolesMetadata();

  const tableColumns = useMemo<ITableColumn<Role>[]>(
    () => [
      {
        header: t('Resource name'),
        cell: (role) => (
          <TextCell
            text={role.summary_fields.resource_name}
            to={
              role.summary_fields.resource_id &&
              role.summary_fields.resource_type === 'organization'
                ? RouteObj.OrganizationDetails.replace(
                    ':id',
                    role.summary_fields.resource_id.toString()
                  )
                : undefined
            }
          />
        ),
        sort: 'id',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Resource type'),
        cell: (role) => <TextCell text={role.summary_fields.resource_type_display_name} />,
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Role'),
        cell: (role) => <TextCell text={role.name} />,
        list: 'secondary',
      },
      {
        header: t('Description'),
        cell: (role) => {
          if (!role.summary_fields.resource_type) return;
          const roles = (rolesMetadata as Record<string, IRoles>)[
            role.summary_fields.resource_type
          ];
          if (roles) {
            const roleMetadata = Object.values(roles).find(
              (roleMetadata) => roleMetadata.id === role.name
            );
            if (roleMetadata) {
              return <TextCell text={roleMetadata.description} />;
            }
          }
        },
        card: 'description',
        list: 'description',
      },
    ],
    [rolesMetadata, t]
  );
  return tableColumns;
}
