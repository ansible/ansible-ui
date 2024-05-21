import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  TextCell,
  useGetPageUrl,
  ColumnModalOption,
  DateTimeCell,
} from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';

export function useAwxRoleColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<AwxRbacRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => (
          <TextCell
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(AwxRoute.RoleDetails, {
                    params: { id: role.id, resourceType: role.content_type || 'null' },
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
        value: (role) => role.description,
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
