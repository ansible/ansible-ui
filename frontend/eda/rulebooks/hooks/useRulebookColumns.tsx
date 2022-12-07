import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function useRulebookColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRulebook>[]>(
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
        cell: (rulebook) => (
          <TextCell
            text={rulebook.name}
            onClick={() =>
              navigate(RouteE.EdaRulebookDetails.replace(':id', rulebook.id.toString()))
            }
          />
        ),
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
    ],
    [navigate, t]
  );
}
