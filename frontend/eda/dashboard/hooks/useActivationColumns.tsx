import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusCell } from '../../../common/StatusCell';

export function useActivationColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('Name'),
        cell: (activation) => (
          <TextCell
            text={activation.name}
            onClick={() =>
              navigate(
                RouteObj.EdaRulebookActivationDetails.replace(':id', activation.id.toString())
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
        header: t('Status'),
        cell: (activation) => <StatusCell status={activation.status} />,
        sort: 'status',
        defaultSort: true,
      },
    ],
    [navigate, t]
  );
}
