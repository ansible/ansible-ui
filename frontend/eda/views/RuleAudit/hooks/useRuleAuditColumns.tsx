import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnModalOption, ITableColumn, TextCell } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../../Routes';
import { StatusCell } from '../../../../common/StatusCell';
import { EdaRuleAudit } from '../../../interfaces/EdaRuleAudit';

export function useRuleAuditColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRuleAudit>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.name}
            onClick={() =>
              navigate(RouteObj.EdaRuleAuditDetails.replace(':id', ruleAudit?.id?.toString()))
            }
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (ruleAudit) => <StatusCell status={ruleAudit?.status} />,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Rulebook activation'),
        cell: (ruleAudit) =>
          ruleAudit?.activation_instance?.id ? (
            <TextCell
              text={ruleAudit?.activation_instance?.name || ''}
              onClick={() =>
                navigate(
                  RouteObj.EdaRulebookActivationDetails.replace(
                    ':id',
                    ruleAudit?.activation_instance?.id?.toString() || ''
                  )
                )
              }
            />
          ) : (
            <TextCell text={ruleAudit?.activation_instance?.name || ''} />
          ),
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last fired date'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.fired_at ? formatDateString(new Date(ruleAudit.fired_at)) : ''}
          />
        ),
      },
    ],
    [navigate, t]
  );
}
