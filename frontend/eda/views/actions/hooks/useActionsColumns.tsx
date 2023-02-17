import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaAction } from '../../../interfaces/EdaAction';
import { StatusCell } from '../../../../common/StatusCell';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export function useActionsColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaAction>[]>(
    () => [
      {
        header: t('Name'),
        cell: (action) => (
          <TextCell
            text={action?.rule?.name}
            onClick={() =>
              navigate(RouteE.EdaActionDetails.replace(':id', action?.rule?.id?.toString()))
            }
          />
        ),
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (action) => <StatusCell status={action?.status} />,
        sort: 'status',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Rule'),
        cell: (action) => <TextCell text={action.rule.name} />,
      },
      {
        header: t('Rule set'),
        cell: (action) => (
          <TextCell
            text={action.ruleset.name}
            onClick={() =>
              navigate(RouteE.EdaRulesetDetails.replace(':id', action.ruleset.id.toString()))
            }
          />
        ),
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Last fired date'),
        cell: (action) => (
          <TextCell
            text={action?.fired_date ? formatDateString(new Date(action.fired_date)) : ''}
          />
        ),
        sort: 'fired_at',
      },
    ],
    [navigate, t]
  );
}
