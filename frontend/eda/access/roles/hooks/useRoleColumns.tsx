import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { EdaRole } from '../../../interfaces/EdaRole';
import { EdaRoute } from '../../../main/EdaRoutes';

export function useRoleColumns(withLinks: boolean) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) =>
          withLinks ? (
            <TextCell
              text={role.name}
              to={getPageUrl(EdaRoute.RoleDetails, { params: { id: role.id } })}
            />
          ) : (
            <TextCell text={role.name} />
          ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (role) => role.description && <TextCell text={role.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [t, withLinks, getPageUrl]
  );
}
