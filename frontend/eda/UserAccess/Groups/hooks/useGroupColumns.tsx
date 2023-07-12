import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaGroup } from '../../../interfaces/EdaGroup';

export function useGroupColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaGroup>[]>(
    () => [
      {
        header: t('Name'),
        cell: (group) => (
          <TextCell
            text={group.name}
            to={RouteObj.EdaGroupDetails.replace(':id', group.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (group) => group?.description && <TextCell text={group.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
}
