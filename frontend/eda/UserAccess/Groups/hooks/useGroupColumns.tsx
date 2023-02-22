import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaGroup } from '../../../interfaces/EdaGroup';

export function useGroupColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaGroup>[]>(
    () => [
      {
        header: t('Name'),
        cell: (group) => (
          <TextCell
            text={group.name}
            onClick={() => navigate(RouteE.EdaGroupDetails.replace(':id', group.id.toString()))}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        cell: (group) => group?.description && <TextCell text={group.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [navigate, t]
  );
}
