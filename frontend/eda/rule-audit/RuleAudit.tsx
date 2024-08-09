import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaRuleAuditItem } from '../interfaces/EdaRuleAudit';
import { useRuleAuditColumns } from './hooks/useRuleAuditColumns';
import { useRuleAuditFilters } from './hooks/useRuleAuditFilters';

const ruleAuditEndpoint = edaAPI`/audit-rules/`;

export function RuleAudit() {
  const { t } = useTranslation();
  const toolbarFilters = useRuleAuditFilters();
  const tableColumns = useRuleAuditColumns();
  const view = useEdaView<EdaRuleAuditItem>({
    url: ruleAuditEndpoint,
    tableColumns,
    toolbarFilters,
  });

  return (
    <PageLayout>
      <PageHeader
        title={`Rule Audit`}
        titleHelpTitle={t('Rule Audit')}
        titleHelp={t(
          'Rule audit allows auditing of rules which have been triggered by incoming events.'
        )}
        description={t(
          'Rule audit allows auditing of rules which have been triggered by incoming events.'
        )}
      />
      <PageTable
        id="eda-rule-audit-table"
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        emptyStateIcon={CubesIcon}
        errorStateTitle={t('Error loading rule audit data')}
        emptyStateTitle={t('There is currently no rule audit data for your organization.')}
        emptyStateDescription={t('Rule audit data will populate once a rulebook activation runs.')}
        {...view}
        defaultSubtitle={t('Rule Audit')}
      />
    </PageLayout>
  );
}
