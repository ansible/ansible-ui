import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { HubUser } from '../../../interfaces/expanded/HubUser';
import { HubRoute } from '../../../main/HubRoutes';

export function useUserColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<HubUser>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={getPageUrl(HubRoute.UserPage, { params: { id: user.id } })}
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
    ],
    [getPageUrl, t]
  );
}
