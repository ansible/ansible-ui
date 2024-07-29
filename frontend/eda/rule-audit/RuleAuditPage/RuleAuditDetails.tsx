import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { LabelsCell, PageDetail, PageDetails, useGetPageUrl } from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { StatusCell } from '../../../common/Status';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRuleAudit } from '../../interfaces/EdaRuleAudit';
import { EdaRoute } from '../../main/EdaRoutes';

export function RuleAuditDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();

  const { data: ruleAudit } = useGet<EdaRuleAudit>(edaAPI`/audit-rules/${params.id ?? ''}/`);
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{ruleAudit?.name || ''}</PageDetail>
      <PageDetail label={t('Status')}>
        <StatusCell status={ruleAudit?.status || ''} />
      </PageDetail>
      <PageDetail
        label={t('Rulebook activation')}
        helpText={t`Rulebook activations are rulebooks that have been activated to run.`}
      >
        {ruleAudit && ruleAudit.activation_instance?.id ? (
          <Link
            to={getPageUrl(EdaRoute.RulebookActivationInstancePage, {
              params: { id: ruleAudit.id, instanceId: ruleAudit.activation_instance?.id },
            })}
          >
            {ruleAudit?.activation_instance?.name}
          </Link>
        ) : (
          <LabelsCell
            labels={[
              ruleAudit?.activation_instance?.name === 'DELETED' ? t('Deleted') : t('Unknown'),
            ]}
          />
        )}
      </PageDetail>
      <PageDetail label={t('Rule set')}>{ruleAudit?.ruleset_name || ''}</PageDetail>
      <PageDetail label={t('Created')}>
        {ruleAudit?.created_at ? formatDateString(ruleAudit?.created_at) : ''}
      </PageDetail>
      <PageDetail label={t('Last fired date')}>
        {ruleAudit?.fired_at ? formatDateString(ruleAudit?.fired_at) : ''}
      </PageDetail>
    </PageDetails>
  );
}
