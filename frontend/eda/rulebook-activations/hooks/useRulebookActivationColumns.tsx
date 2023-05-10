import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/StatusCell';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

export function useRulebookActivationColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rulebookActivation) => (
          <TextCell
            text={rulebookActivation.name}
            onClick={() =>
              navigate(
                RouteObj.EdaRulebookActivationDetails.replace(
                  ':id',
                  rulebookActivation.id.toString()
                )
              )
            }
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (activation) => activation.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Activation status'),
        cell: (activation) => <StatusCell status={activation?.status} />,
      },
      {
        header: t('Number of rules'),
        type: 'count',
        value: (activation) => activation?.rules_count ?? 0,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Fire count'),
        type: 'count',
        value: (activation) => activation?.rules_fired_count ?? 0,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Restart count'),
        type: 'count',
        value: (activation) => activation?.restart_count ?? 0,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (activation) => activation.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (activation) => activation.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [navigate, t]
  );
}
