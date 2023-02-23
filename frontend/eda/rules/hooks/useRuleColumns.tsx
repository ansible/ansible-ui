import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRule } from '../../interfaces/EdaRule';
import { formatDateString } from '../../../../framework/utils/formatDateString';

export function useRuleColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMemo<ITableColumn<EdaRule>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rule) => (
          <TextCell
            text={rule.name}
            onClick={() => navigate(RouteObj.EdaRuleDetails.replace(':id', rule.id.toString()))}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Rule set'),
        cell: (rule) => <TextCell text={`Ruleset ${rule?.ruleset || ''} `} />,
        sort: 'ruleset',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Action Type'),
        cell: (rule) => <TextCell text={rule.action ? Object.keys(rule.action)[0] : ''} />,
        sort: 'action',
        defaultSort: true,
      },
      {
        header: t('Last fired date'),
        cell: (rule) => (
          <TextCell
            text={
              rule?.fired_stats?.fired_date ? formatDateString(rule.fired_stats.fired_date) : ''
            }
          />
        ),
        sort: 'fired_at',
      },
    ],
    [navigate, t]
  );
}
