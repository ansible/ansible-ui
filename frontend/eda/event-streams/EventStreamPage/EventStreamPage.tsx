import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteEventStreams } from '../hooks/useDeleteEventStreams';

export function EventStreamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: eventStream } = useGet<EdaEventStream>(edaAPI`/event-streams/${params.id ?? ''}/`);

  const deleteEventStreams = useDeleteEventStreams((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.EventStreams);
    }
  });

  const itemActions = useMemo<IPageAction<EdaEventStream>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit event stream'),
        onClick: (eventStream: EdaEventStream) =>
          pageNavigate(EdaRoute.EditEventStream, { params: { id: eventStream.id } }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete event stream'),
        onClick: (eventStream: EdaEventStream) => deleteEventStreams([eventStream]),
        isDanger: true,
      },
    ],
    [deleteEventStreams, pageNavigate, t]
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={eventStream?.name}
        breadcrumbs={[
          { label: t('Event Streams'), to: getPageUrl(EdaRoute.EventStreams) },
          { label: eventStream?.name },
        ]}
        headerActions={
          <PageActions<EdaEventStream>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={eventStream}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Event Streams'),
          page: EdaRoute.EventStreams,
          persistentFilterKey: 'event-streams',
        }}
        tabs={[{ label: t('Details'), page: EdaRoute.EventStreamDetails }]}
        params={{ id: eventStream?.id }}
      />
    </PageLayout>
  );
}
