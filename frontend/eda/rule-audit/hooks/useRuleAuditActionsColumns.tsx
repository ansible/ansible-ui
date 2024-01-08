import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { StatusCell } from '../../../common/Status';
import { EdaRuleAuditAction } from '../../interfaces/EdaRuleAuditAction';

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
              to={ruleAuditAction?.url}
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
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
}
