import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnTableOption, ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaDecisionEnvironmentCell } from '../../Resources/decision-environments/components/EdaDecisionEnvironmentCell';
import { EdaProjectCell } from '../../Resources/projects/components/EdaProjectCell';
import { StatusLabelCell } from '../../common/StatusLabelCell';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRulebookCell } from '../../rulebooks/components/EdaRulebookCell';

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
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (activation) => activation.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Status'),
        cell: (activation) => <StatusLabelCell status={activation?.status} />,
        sort: 'status',
        defaultSort: true,
      },
      {
        header: t('Rulebook'),
        cell: (activation) => <EdaRulebookCell id={activation.rulebook_id} />,
        value: (activation) => activation.rulebook_id,
        // table: ColumnTableOption.Expanded,
      },
      {
        header: t('Project'),
        cell: (activation) => <EdaProjectCell id={activation.project_id} />,
        value: (activation) => activation.project_id,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
      },
      {
        header: t('Decision Environment'),
        cell: (activation) => (
          <EdaDecisionEnvironmentCell id={activation.decision_environment_id} />
        ),
        value: (activation) => activation.decision_environment_id,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
      },
      {
        header: t('Rules'),
        type: 'count',
        value: (activation) => activation?.rules_count ?? 0,
        sort: 'rules_count',
      },
      {
        header: t('Fire count'),
        type: 'count',
        value: (activation) => activation?.fired_count ?? 0,
        sort: 'fired_count',
      },
      {
        header: t('Restarts'),
        type: 'count',
        value: (activation) => activation?.restarted_count ?? 0,
        sort: 'restart_count',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (activation) => activation.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (activation) => activation.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [navigate, t]
  );
}
