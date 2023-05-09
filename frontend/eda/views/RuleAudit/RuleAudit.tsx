import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { EdaRuleAudit } from '../../interfaces/EdaRuleAudit';
import { useRuleAuditColumns } from './hooks/useRuleAuditColumns';
import { useRuleAuditFilters } from './hooks/useRuleAuditFilters';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';
import { CubesIcon } from '@patternfly/react-icons';

const ruleAuditEndpoint = `${API_PREFIX}/audit-rules/`;

export function RuleAudit() {
  const { t } = useTranslation();
  const tableColumns = useRuleAuditColumns();
  const view = useEdaView<EdaRuleAudit>({
    url: ruleAuditEndpoint,
    tableColumns,
  });

  return (
    <PageLayout>
      <PageHeader
        title={`Rule Audit`}
        description={t(
          'Rule audit allows auditing of rules which have been triggered by incoming events.'
        )}
      />
      <PageTable
        tableColumns={tableColumns}
        emptyStateIcon={CubesIcon}
        errorStateTitle={t('Error loading rule audit data')}
        emptyStateTitle={t('No rule audit data')}
        emptyStateDescription={t('No rule audit data')}
        {...view}
        defaultSubtitle={t('Rule Audit')}
      />
    </PageLayout>
  );
}
