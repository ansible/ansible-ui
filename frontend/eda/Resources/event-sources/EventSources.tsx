import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { EdaEventSource } from '../../interfaces/EdaEventSource';
import { useEventSourceActions } from './hooks/useEventSourceActions';
import { useEventSourcesColumns } from './hooks/useEventSourcesColumns';
import { useEventSourceFilters } from './hooks/useEventSourceFilters';
import { useEventSourcesActions } from './hooks/useEventSourcesActions';
import { useEdaView } from '../../common/useEventDrivenView';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';

export function EventSources() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useEventSourceFilters();
  const tableColumns = useEventSourcesColumns();
  const view = useEdaView<EdaEventSource>({
    url: edaAPI`/sources/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useEventSourcesActions(view);
  const rowActions = useEventSourceActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Event Sources')} description={t('Event sources.')} />
      <PageTable
        id="eda-sources-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading event sources')}
        emptyStateTitle={t('There are currently no event sources created for your organization.')}
        emptyStateDescription={t('Please create an event source by using the button below.')}
        emptyStateButtonText={t('Create event source')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateEventSource)}
        {...view}
        defaultSubtitle={t('Event Source')}
      />
    </PageLayout>
  );
}
