import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../../common/crud/useGet';
import { EdaRoute } from '../../../EdaRoutes';
import { SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaRuleAudit } from '../../../interfaces/EdaRuleAudit';
import { edaAPI } from '../../../api/eda-utils';

export function RuleAuditPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();

  const { data: ruleAudit } = useGet<EdaRuleAudit>(
    edaAPI`/audit-rules/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  return (
    <PageLayout>
      <PageHeader
        title={ruleAudit?.name}
        breadcrumbs={[
          { label: t('Rule Audit'), to: getPageUrl(EdaRoute.RuleAudits) },
          { label: ruleAudit?.name },
        ]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Rule Audit'),
          page: EdaRoute.RuleAudits,
          persistentFilterKey: 'rule-audit',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.RuleAuditDetails },
          { label: t('Actions'), page: EdaRoute.RuleAuditActions },
          { label: t('Events'), page: EdaRoute.RuleAuditEvents },
        ]}
        params={{ id: params.id }}
      />
    </PageLayout>
  );
}
