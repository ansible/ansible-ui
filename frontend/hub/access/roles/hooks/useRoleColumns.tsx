import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
import { useLockedRolesWithDescription } from './useLockedRolesWithDescription';
import { Role } from '../Role';
import { useMemo } from 'react';

export function useRoleColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const lockedRolesWithDescription = useLockedRolesWithDescription();
  const tableColumns = useMemo<ITableColumn<Role>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => <TextCell text={role.name} />,
        sort: options?.disableSort ? undefined : 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (role) => (
          <span style={{ maxWidth: 150, whiteSpace: 'normal' }}>
            {lockedRolesWithDescription[role.name] ?? role.description}
          </span>
        ),
        minWidth: 150,
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Created'),
        cell: (item) => <DateTimeCell format="since" value={item.pulp_created} />,
        sort: 'pulp_created',
        defaultSortDirection: 'desc',
      },
      {
        header: t('Editable'),
        type: 'text',
        value: (role) => (role.locked ? t('Built-in') : t('Editable')),
        sort: 'locked',
        defaultSortDirection: 'asc',
        card: 'subtitle',
        list: 'subtitle',
      },
    ],

    [t, options?.disableSort, lockedRolesWithDescription]
  );

  return tableColumns;
}
