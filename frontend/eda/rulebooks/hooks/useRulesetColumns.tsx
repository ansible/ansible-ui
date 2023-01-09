import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaRuleset } from '../../interfaces/EdaRuleset';

export function useRulesetColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRuleset>[]>(
    () => [
      {
        header: t('ID'),
        cell: (ruleset) => ruleset.id,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        isIdColumn: true,
      },
      {
        header: t('Name'),
        cell: (ruleset) => (
          <TextCell
            text={ruleset.name}
            onClick={() => navigate(RouteE.EdaRulesetDetails.replace(':id', ruleset.id.toString()))}
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
