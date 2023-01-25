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
      {
        header: t('Number of Rules'),
        cell: (ruleset) => (
          <TextCell text={ruleset?.rule_count ? ruleset?.rule_count.toString() : ''} />
        ),
        sort: 'rule_count',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Fire count'),
        cell: (ruleset) => (
          <TextCell text={ruleset?.fired_count ? ruleset?.fired_count.toString() : ''} />
        ),
        sort: 'fired_count',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
    ],
    [navigate, t]
  );
}
