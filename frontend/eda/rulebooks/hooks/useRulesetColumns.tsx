import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRuleset } from '../../interfaces/EdaRuleset';

export function useRulesetColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRuleset>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleset) => (
          <TextCell
            text={ruleset.name}
            to={RouteObj.EdaRulesetDetails.replace(':id', ruleset.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Number of rules'),
        cell: (ruleset) => (
          <TextCell text={ruleset?.rule_count ? ruleset?.rule_count.toString() : ''} />
        ),
        card: 'name',
        list: 'name',
      },
      // {
      //   header: t('Fire count'),
      //   cell: (ruleset) => (
      //     <TextCell
      //       text={ruleset?.fired_stats?.fired_count ? `${ruleset.fired_stats.fired_count}` : ''}
      //     />
      //   ),
      //   card: 'name',
      //   list: 'name',
      // },
    ],
    [t]
  );
}
