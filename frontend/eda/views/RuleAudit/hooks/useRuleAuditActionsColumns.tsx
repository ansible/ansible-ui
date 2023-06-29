import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { EdaRuleAuditAction } from '../../../interfaces/EdaRuleAuditAction';
import { StatusCell } from '../../../../common/Status';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

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
              icon={<ExternalLinkAltIcon />}
              iconAlign={'right'}
              onClick={() => {
                open(ruleAuditAction?.url, '_blank');
              }}
            />
          ) : (
            <TextCell text={ruleAuditAction?.name} />
          ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (ruleAuditAction) => <StatusCell status={ruleAuditAction?.status} />,
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
      },
    ],
    [t]
  );
}
