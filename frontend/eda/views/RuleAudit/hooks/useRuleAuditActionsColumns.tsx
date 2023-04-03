import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { EdaRuleAuditAction } from '../../../interfaces/EdaRuleAuditAction';

export function useRuleAuditActionsColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRuleAuditAction>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleAuditAction) => <TextCell text={ruleAuditAction?.name} />,
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
    ],
    [t]
  );
}
