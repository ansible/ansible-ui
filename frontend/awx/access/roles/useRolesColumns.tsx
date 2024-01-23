import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { Role } from '../../interfaces/Role';
import { AwxRoute } from '../../main/AwxRoutes';
import { useAwxRoles } from './useAwxRoles';

export function useRolesColumns() {
  const { t } = useTranslation();
  const awxRoles = useAwxRoles();
  const getPageUrl = useGetPageUrl();

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
                ? getPageUrl(AwxRoute.OrganizationDetails, {
                    params: { id: role.summary_fields.resource_id },
                  })
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
          const resourceTypeRoles = awxRoles[role.summary_fields.resource_type];
          if (resourceTypeRoles) {
            const resourceRole = resourceTypeRoles.roles[role.name];
            if (resourceRole) {
              return <TextCell text={resourceRole.description} />;
            }
          }
        },
        card: 'description',
        list: 'description',
      },
    ],
    [getPageUrl, awxRoles, t]
  );
  return tableColumns;
}
