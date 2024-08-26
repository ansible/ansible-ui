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
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

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
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/event-streams/`);
  const canCreateEventStream = Boolean(data && data.actions && data.actions['POST']);
  const rowActions = useEventStreamActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Event Streams')}
        description={t(
          'Event streams represent server side webhooks which ease the routing issues related to running webhooks ' +
            'individually in a container or a pod. Sources can be swapped in a rulebook with a matching event stream.'
        )}
      />
      <PageTable
        id="eda-event-streams-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading event streams')}
        emptyStateTitle={
          canCreateEventStream
            ? t('There are currently no event streams created for your organization.')
            : t('You do not have permission to create an event stream.')
        }
        emptyStateDescription={
          canCreateEventStream
            ? t('Please create an event stream by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateEventStream ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateEventStream ? t('Create event stream') : undefined}
        emptyStateButtonClick={
          canCreateEventStream ? () => pageNavigate(EdaRoute.CreateEventStream) : undefined
        }
        {...view}
        defaultSubtitle={t('Event stream')}
      />
    </PageLayout>
  );
}
