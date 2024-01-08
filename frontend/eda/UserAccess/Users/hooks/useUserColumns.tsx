import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  LabelsCell,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { EdaUser } from '../../../interfaces/EdaUser';

export function useUserColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaUser>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={getPageUrl(EdaRoute.UserPage, { params: { id: user.id } })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('First name'),
        cell: (user) => user.first_name && <TextCell text={user.first_name} />,
      },
      {
        header: t('Last name'),
        cell: (user) => user.last_name && <TextCell text={user.last_name} />,
      },
      {
        header: t('Role(s)'),
        cell: (user) =>
          user.roles &&
          user.roles.length > 0 && <LabelsCell labels={user.roles.map((role) => role?.name)} />,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [getPageUrl, t]
  );
}
