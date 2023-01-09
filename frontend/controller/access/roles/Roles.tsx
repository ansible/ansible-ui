import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, TextCell } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { Role } from '../../interfaces/Role';

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
                ? RouteE.OrganizationDetails.replace(
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
        sort: 'role.summary_fields.resource_type_display_name',
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('User role'),
        cell: (role) => <TextCell text={role.name} />,
        sort: 'name',
        list: 'secondary',
      },
      {
        header: t('Description'),
        cell: (role) => {
          switch (role.summary_fields.resource_type) {
            case 'credential':
              switch (role.name) {
                case 'Admin':
                  return <TextCell text={t('Can manage all aspects of the credential')} />;
                case 'Read':
                  return <TextCell text={t('May view settings for the credential')} />;
                case 'Use':
                  return <TextCell text={t('Can use the credential in a job template')} />;
              }
              break;
            case 'organization':
              switch (role.name) {
                case 'Member':
                  return <TextCell text={t('Has all the permissions of the organization')} />;
              }
              break;
            case 'team':
              switch (role.name) {
                case 'Member':
                  return <TextCell text={t('Has all the permissions of the team')} />;
              }
              break;
          }
        },
        sort: 'name',
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
  return tableColumns;
}
