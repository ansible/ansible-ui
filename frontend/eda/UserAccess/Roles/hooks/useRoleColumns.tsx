import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaRole } from '../../../interfaces/EdaRole';

export function useRoleColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => (
          <TextCell
            text={role.name}
            onClick={() => navigate(RouteE.EdaRoleDetails.replace(':id', role.id.toString()))}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        cell: (role) => role.description && <TextCell text={role.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [navigate, t]
  );
}
