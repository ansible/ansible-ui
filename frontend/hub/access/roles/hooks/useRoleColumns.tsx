import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  DateTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useManagedRolesWithDescription } from './useManagedRolesWithDescription';

export function useRoleColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const managedRolesWithDescription = useManagedRolesWithDescription();

  return useMemo<ITableColumn<HubRbacRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => (
          <TextCell
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(HubRoute.RoleDetails, {
                    params: { id: role.id },
                  })
            }
            text={role.name}
          />
        ),
        sort: options?.disableSort ? undefined : 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (role) => managedRolesWithDescription[role.name] ?? role.description,
        sort: options?.disableSort ? undefined : 'description',
        card: 'description',
        list: 'description',
      },
      {
        header: t('Created'),
        cell: (role) => <DateTimeCell value={role.created} />,
        sort: options?.disableSort ? undefined : 'created',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Editable'),
        type: 'text',
        value: (role) => (role.managed ? t('Built-in') : t('Editable')),
        sort: options?.disableSort ? undefined : 'managed',
        defaultSortDirection: 'asc',
        card: 'subtitle',
        list: 'subtitle',
        modal: ColumnModalOption.hidden,
      },
    ],
    [t, options?.disableSort, options?.disableLinks, getPageUrl]
  );
}
