import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaHost } from '../../../interfaces/EdaHost';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export function useHostsColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaHost>[]>(
    () => [
      {
        header: t('Name'),
        cell: (host) => (
          <TextCell
            text={host.host}
            onClick={() => navigate(RouteE.EdaRulesetDetails.replace(':id', host.id.toString()))}
          />
        ),
        sort: 'ost',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Rule'),
        cell: (host) => (
          <TextCell
            text={host?.rule.name}
            onClick={() =>
              navigate(RouteE.EdaRulesetDetails.replace(':id', (host?.rule?.id || '').toString()))
            }
          />
        ),
        sort: 'rule',
        defaultSort: true,
      },
      {
        header: t('Rule set'),
        cell: (host) => (
          <TextCell
            text={host.ruleset?.name}
            onClick={() =>
              navigate(
                RouteE.EdaRulesetDetails.replace(':id', (host?.ruleset?.id || '').toString())
              )
            }
          />
        ),
        sort: 'rule',
        defaultSort: true,
      },

      {
        header: t('Last fired date'),
        cell: (host) => (
          <TextCell text={host?.fired_date ? formatDateString(new Date(host.fired_date)) : ''} />
        ),
        sort: 'fired_at',
      },
    ],
    [navigate, t]
  );
}
