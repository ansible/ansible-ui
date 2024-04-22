import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { EdaUser } from '../../../interfaces/EdaUser';
import { EdaRoute } from '../../../main/EdaRoutes';

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
        sort: 'username',
        card: 'name',
        list: 'name',
      },
      {
        header: t('User type'),
        type: 'text',
        value: (user) => {
          if (user.is_superuser) return t('System adminsitrator');
          return t('Normal user');
        },
        card: 'subtitle',
        list: 'subtitle',
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
