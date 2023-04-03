import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { EdaRuleAuditEvent } from '../../../interfaces/EdaRuleAuditEvent';

export function useRuleAuditEventsColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRuleAuditEvent>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleAuditEvent) => <TextCell text={ruleAuditEvent?.source_name} />,
        sort: 'source_name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Source type'),
        cell: (ruleAuditEvent) => <TextCell text={ruleAuditEvent.source_type} />,
      },
      {
        header: t('Timestamp'),
        cell: (ruleAuditEvent) => (
          <TextCell
            text={
              ruleAuditEvent?.received_at
                ? formatDateString(new Date(ruleAuditEvent.received_at))
                : ''
            }
          />
        ),
        sort: 'received_at',
      },
    ],
    [t]
  );
}
