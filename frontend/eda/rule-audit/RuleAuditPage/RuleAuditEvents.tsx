import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaRuleAuditEvent } from '../../interfaces/EdaRuleAuditEvent';
import { useRuleAuditEventsColumns } from '../hooks/useRuleAuditEventsColumns';
import { useRuleAuditEventsFilters } from '../hooks/useRuleAuditEventsFilters';

export function RuleAuditEvents() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const toolbarFilters = useRuleAuditEventsFilters();
  const tableColumns = useRuleAuditEventsColumns();
  const view = useEdaView<EdaRuleAuditEvent>({
    url: edaAPI`/audit-rules/${params?.id || ''}/events/`,
    tableColumns,
    toolbarFilters,
  });
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading events')}
        emptyStateTitle={t('No events')}
        emptyStateIcon={CubesIcon}
        emptyStateDescription={t('No events for this rule audit')}
        {...view}
        defaultSubtitle={t('Rule Audit Event')}
      />
    </PageLayout>
  );
}
