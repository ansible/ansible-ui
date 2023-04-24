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
import { EdaDecisionEnvironmentCell } from '../../Resources/decision-environments/components/EdaDecisionEnvironmentCell';
import { API_PREFIX } from '../../constants';
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
        header: t('Status'),
        cell: (activation) => <StatusCell status={activation?.status} />,
      },
      {
        header: t('Rulebook'),
        type: 'text',
        value: (activation) => activation.rulebook.name,
        // table: ColumnTableOption.Expanded,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Project'),
        cell: (activation) => (
          <TextCell
            text={activation.project?.name}
            to={`${API_PREFIX}/projects/${activation.project?.id ?? ''}`}
          />
        ),
        value: (activation) => activation.project?.name,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Decision environment'),
        cell: (activation) => (
          <EdaDecisionEnvironmentCell id={activation.decision_environment?.id} />
        ),
        value: (activation) => activation.decision_environment?.id,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      // {
      //   header: t('Rules'),
      //   type: 'count',
      //   value: (activation) => activation?.rules_count ?? 0,
      //   modal: ColumnModalOption.Hidden,
      // },
      // {
      //   header: t('Fire count'),
      //   type: 'count',
      //   value: (activation) => activation?.fired_count ?? 0,
      //   modal: ColumnModalOption.Hidden,
      // },
      // {
      //   header: t('Restarts'),
      //   type: 'count',
      //   value: (activation) => activation?.restarted_count ?? 0,
      //   modal: ColumnModalOption.Hidden,
      // },
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
