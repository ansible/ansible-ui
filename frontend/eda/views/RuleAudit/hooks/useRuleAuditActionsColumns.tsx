import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { EdaRuleAuditAction } from '../../../interfaces/EdaRuleAuditAction';
import { StatusCell } from '../../../../common/StatusCell';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export function useRuleAuditActionsColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRuleAuditAction>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleAuditAction) =>
          ruleAuditAction?.url ? (
            <TextCell
              text={ruleAuditAction?.name}
              onClick={() => {
                open(ruleAuditAction?.url, '_blank');
              }}
            />
          ) : (
            <TextCell text={ruleAuditAction?.name} />
          ),
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (ruleAuditAction) => <StatusCell status={ruleAuditAction?.status} />,
        sort: 'status',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Last fired date'),
        cell: (ruleAuditAction) => (
          <TextCell
            text={
              ruleAuditAction?.fired_at ? formatDateString(new Date(ruleAuditAction.fired_at)) : ''
            }
          />
        ),
        sort: 'fired_at',
      },
    ],
    [t]
  );
}
