import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaEventStream } from '../interfaces/EdaEventStream';
import { EdaRoute } from '../main/EdaRoutes';
import { useEventStreamActions } from './hooks/useEventStreamActions';
import { useEventStreamColumns } from './hooks/useEventStreamColumns';
import { useEventStreamFilters } from './hooks/useEventStreamFilters';
import { useEventStreamsActions } from './hooks/useEventStreamsActions';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function EventStreams() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useEventStreamFilters();
  const tableColumns = useEventStreamColumns();
  const view = useEdaView<EdaEventStream>({
    url: edaAPI`/event-streams/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useEventStreamsActions(view);
  const rowActions = useEventStreamActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Event Streams')} description={t('Event streams.')} />
      <PageTable
        id="eda-event-streams-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading event streams')}
        emptyStateTitle={t('There are currently no event streams created for your organization.')}
        emptyStateDescription={t('Please create a event stream by using the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create event stream')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateEventStream)}
        {...view}
        defaultSubtitle={t('Event stream')}
      />
    </PageLayout>
  );
}
