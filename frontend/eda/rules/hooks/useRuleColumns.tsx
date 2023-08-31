import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../common/Routes';
import { EdaProjectCell } from '../../Resources/projects/components/EdaProjectCell';
import { EdaRule } from '../../interfaces/EdaRule';
import { EdaRulebookCell } from '../../rulebooks/components/EdaRulebookCell';

export function useRuleColumns() {
  const { t } = useTranslation();

  return useMemo<ITableColumn<EdaRule>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rule) => (
          <TextCell
            text={rule.name}
            to={RouteObj.EdaRuleDetails.replace(':id', rule.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Project'),
        cell: (rule) => <EdaProjectCell id={rule.project} />,
        value: (rule) => rule.project,
        list: 'secondary',
      },
      {
        header: t('Rulebook'),
        cell: (rule) => <EdaRulebookCell id={rule.rulebook} />,
        value: (rule) => rule.rulebook,
        list: 'secondary',
      },
      // {
      //   header: t('Ruleset'),
      //   cell: (rule) => <EdaRulesetCell id={rule.rulebook} />,
      //   value: (rule) => rule.project,
      // },
      {
        header: t('Action'),
        cell: (rule) => <TextCell text={rule.action ? Object.keys(rule.action)[0] : ''} />,
      },
      {
        header: t('Last fired date'),
        cell: (rule) => (
          <TextCell
            text={
              rule?.fired_stats?.last_fired_at
                ? formatDateString(rule.fired_stats.last_fired_at)
                : ''
            }
          />
        ),
      },
    ],
    [t]
  );
}
