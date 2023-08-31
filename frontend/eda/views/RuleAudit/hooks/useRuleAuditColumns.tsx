import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, ITableColumn, TextCell } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../../common/Routes';
import { StatusCell } from '../../../../common/Status';
import { EdaRuleAuditItem } from '../../../interfaces/EdaRuleAudit';

export function useRuleAuditColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRuleAuditItem>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.name}
            to={RouteObj.EdaRuleAuditDetails.replace(':id', ruleAudit?.id?.toString())}
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
              to={RouteObj.EdaActivationInstanceDetails.replace(
                ':id',
                ruleAudit?.activation_instance?.id?.toString() || ''
              )}
            />
          ) : (
            <TextCell text={ruleAudit?.activation_instance?.name || ''} />
          ),
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Fired date'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.fired_at ? formatDateString(new Date(ruleAudit.fired_at)) : ''}
          />
        ),
      },
    ],
    [t]
  );
}
