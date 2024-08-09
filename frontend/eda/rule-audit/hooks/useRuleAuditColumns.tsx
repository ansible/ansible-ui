import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, LabelsCell, TextCell, useGetPageUrl } from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { StatusCell } from '../../../common/Status';
import { EdaRuleAuditItem } from '../../interfaces/EdaRuleAudit';
import { EdaRoute } from '../../main/EdaRoutes';

export function useRuleAuditColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaRuleAuditItem>[]>(
    () => [
      {
        header: t('Name'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.name}
            to={getPageUrl(EdaRoute.RuleAuditPage, { params: { id: ruleAudit?.id } })}
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
              to={getPageUrl(EdaRoute.RulebookActivationInstancePage, {
                params: { id: ruleAudit?.id, instanceId: ruleAudit?.activation_instance?.id },
              })}
            />
          ) : (
            <LabelsCell
              labels={[
                ruleAudit?.activation_instance?.name === 'DELETED' ? t('Deleted') : t('Unknown'),
              ]}
            />
          ),
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Last fired date'),
        cell: (ruleAudit) => (
          <TextCell
            text={ruleAudit?.fired_at ? formatDateString(new Date(ruleAudit.fired_at)) : ''}
          />
        ),
        modal: 'hidden',
        dashboard: 'hidden',
      },
    ],
    [getPageUrl, t]
  );
}
