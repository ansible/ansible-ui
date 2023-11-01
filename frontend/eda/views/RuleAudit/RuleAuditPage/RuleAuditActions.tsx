import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../../framework';
import { EdaRuleAuditAction } from '../../../interfaces/EdaRuleAuditAction';
import { useEdaView } from '../../../useEventDrivenView';
import { useRuleAuditActionsColumns } from '../hooks/useRuleAuditActionsColumns';
import { useRuleAuditActionsFilters } from '../hooks/useRuleAuditActionsFilters';
import { edaAPI } from '../../../api/eda-utils';

export function RuleAuditActions() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const toolbarFilters = useRuleAuditActionsFilters();
  const tableColumns = useRuleAuditActionsColumns();

  const view = useEdaView<EdaRuleAuditAction>({
    url: edaAPI`/audit-rules/${params?.id || ''}/actions/`,
    tableColumns,
    toolbarFilters,
  });
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading actions')}
        emptyStateTitle={t('No actions yet')}
        emptyStateDescription={t('No actions yet for this rule audit')}
        {...view}
        defaultSubtitle={t('Action')}
      />
    </PageLayout>
  );
}
