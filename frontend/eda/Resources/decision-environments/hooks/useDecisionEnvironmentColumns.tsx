import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaDecisionEnvironment } from '../../../interfaces/EdaDecisionEnvironment';

export function useDecisionEnvironmentColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaDecisionEnvironment>[]>(
    () => [
      {
        header: t('Image name'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment.name}
            onClick={() =>
              navigate(
                RouteObj.EdaDecisionEnvironmentDetails.replace(
                  ':id',
                  decisionEnvironment.id.toString()
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
      {
        header: t('Description'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment?.description ? decisionEnvironment.description : ''}
          />
        ),
      },
    ],

    [navigate, t]
  );
}
