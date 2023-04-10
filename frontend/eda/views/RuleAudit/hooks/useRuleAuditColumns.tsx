import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { StatusCell } from '../../../../common/StatusCell';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
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
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (ruleAudit) => <StatusCell status={ruleAudit?.status} />,
        sort: 'status',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Last fired date'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.fired_at ? formatDateString(new Date(ruleAudit.fired_at)) : ''}
          />
        ),
        sort: 'fired_at',
      },
    ],
    [navigate, t]
  );
}
