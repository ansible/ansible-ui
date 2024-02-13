import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaEventStreamInstance } from '../../interfaces/EdaEventStreamInstance';
import { useEventStreamHistoryColumns } from '../hooks/useEventStreamHistoryColumns';
import { useEventStreamHistoryFilters } from '../hooks/useEventStreamHistoryFilters';

export function EventStreamHistory() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const toolbarFilters = useEventStreamHistoryFilters();

  const tableColumns = useEventStreamHistoryColumns();
  const view = useEdaView<EdaEventStreamInstance>({
    url: edaAPI`/event-streams/${params?.id || ''}/instances/`,
    toolbarFilters,
    tableColumns,
  });
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading history')}
        emptyStateTitle={t('No event stream history')}
        emptyStateIcon={CubesIcon}
        emptyStateDescription={t('No history for this event stream')}
        {...view}
        defaultSubtitle={t('Event Stream History')}
      />
    </PageLayout>
  );
}
