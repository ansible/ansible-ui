import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '../../../framework';
import { PageTableEmptyState } from '../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../framework/components/ButtonLink';
import { useOptions } from '../../common/crud/useOptions';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaEventStream } from '../interfaces/EdaEventStream';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { EdaRoute } from '../main/EdaRoutes';
import { useEventStreamActions } from './hooks/useEventStreamActions';
import { useEventStreamColumns } from './hooks/useEventStreamColumns';
import { useEventStreamFilters } from './hooks/useEventStreamFilters';
import { useEventStreamsActions } from './hooks/useEventStreamsActions';

export function EventStreams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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
        emptyState={
          canCreateEventStream ? (
            <PageTableEmptyState
              title={t('There are currently no event streams created for your organization.')}
              description={t('Please create an event stream by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant="primary"
                href={getPageUrl(EdaRoute.CreateEventStream)}
              >
                {t('Create event stream')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create an event stream')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
        defaultSubtitle={t('Event stream')}
      />
    </PageLayout>
  );
}
