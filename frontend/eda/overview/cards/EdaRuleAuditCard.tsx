import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageTable, useDashboardColumns, useGetPageUrl } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaRuleAuditItem } from '../../interfaces/EdaRuleAudit';
import { EdaRoute } from '../../main/EdaRoutes';
import { useRuleAuditColumns } from '../../rule-audit/hooks/useRuleAuditColumns';

export function EdaRuleAuditCard() {
  const view = useEdaView<EdaRuleAuditItem>({
    url: edaAPI`/audit-rules/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  let columns = useRuleAuditColumns();
  columns = useDashboardColumns(columns);
  return (
    <PageDashboardCard
      id="recent-rule-audits"
      title={t('Rule Audit')}
      subtitle={t('Recently fired rules')}
      height="md"
      linkText={t('View all Rule Audit')}
      to={getPageUrl(EdaRoute.RuleAudits)}
      helpTitle={t('Rule Audit')}
      help={t(
        'Rule audit allows for monitoring and reviewing the execution of defined rules which have been triggered by incoming events.'
      )}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading rule audit records')}
        emptyStateIcon={PlusCircleIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no rule audit records')}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
