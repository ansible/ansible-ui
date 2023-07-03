import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  LabelsCell,
  TextCell,
} from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';

export function useUserColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaUser>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            onClick={() => navigate(RouteObj.EdaUserDetails.replace(':id', user.id.toString()))}
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
    [navigate, t]
  );
}
