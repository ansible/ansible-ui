import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';

export function useUserColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaUser>[]>(
    () => [
      {
        header: t('ID'),
        cell: (inventory) => inventory.id,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        isIdColumn: true,
      },
      {
        header: t('Name'),
        cell: (User) => (
          <TextCell
            text={User.name}
            onClick={() => navigate(RouteObj.EdaUserDetails.replace(':id', User.id.toString()))}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Url'),
        cell: (User) => User.url && <TextCell text={User.url} />,
        card: 'description',
        list: 'description',
      },
    ],
    [navigate, t]
  );
}
