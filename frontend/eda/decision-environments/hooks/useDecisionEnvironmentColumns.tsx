import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';

export function useDecisionEnvironmentColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaDecisionEnvironment>[]>(
    () => [
      {
        header: t('ID'),
        cell: (decisionEnv) => decisionEnv.id,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        isIdColumn: true,
      },
      {
        header: t('Name'),
        cell: (DecisionEnvironment) => (
          <TextCell
            text={DecisionEnvironment.name}
            onClick={() =>
              navigate(
                RouteObj.EdaDecisionEnvironmentDetails.replace(
                  ':id',
                  DecisionEnvironment.id.toString()
                )
              )
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
    ],
    [navigate, t]
  );
}
