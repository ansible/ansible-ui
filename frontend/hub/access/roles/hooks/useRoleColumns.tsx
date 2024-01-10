import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  DateTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubRoute } from '../../../main/HubRoutes';
import { Role } from '../Role';
import { useLockedRolesWithDescription } from './useLockedRolesWithDescription';

export function useRoleColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const lockedRolesWithDescription = useLockedRolesWithDescription();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<Role>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => (
          <TextCell
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(HubRoute.RoleDetails, {
                    params: { id: parsePulpIDFromURL(role.pulp_href) ?? '' },
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
        cell: (role) => (
          <span style={{ minWidth: 200, whiteSpace: 'normal' }}>
            {lockedRolesWithDescription[role.name] ?? role.description}
          </span>
        ),
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Created'),
        cell: (item) => <DateTimeCell format="since" value={item.pulp_created} />,
        sort: 'pulp_created',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Editable'),
        type: 'text',
        value: (role) => (role.locked ? t('Built-in') : t('Editable')),
        sort: 'locked',
        defaultSortDirection: 'asc',
        card: 'subtitle',
        list: 'subtitle',
        modal: ColumnModalOption.Hidden,
      },
    ],

    [t, options?.disableSort, options?.disableLinks, getPageUrl, lockedRolesWithDescription]
  );

  return tableColumns;
}
