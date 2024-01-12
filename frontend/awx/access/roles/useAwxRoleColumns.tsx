import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxRole } from './AwxRoles';

export function useAwxRoleColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const columns = useMemo(() => {
    const columns: ITableColumn<AwxRole>[] = [
      {
        id: 'name',
        header: t('Role'),
        cell: (role: AwxRole) => (
          <TextCell
            text={role.name}
            to={getPageUrl(AwxRoute.Role, {
              params: {
                resourceType: role.resourceId,
                id: role.roleId,
              },
            })}
          />
        ),
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
        type: 'description',
        header: t('Description'),
        value: (role: AwxRole) => role.description,
      },
    ];
    return columns;
  }, [getPageUrl, t]);
  return columns;
}
