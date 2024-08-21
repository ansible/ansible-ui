import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { DatabaseIcon, PencilAltIcon, TaskIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
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
  usePageAlertToaster,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteEventStreams } from '../hooks/useDeleteEventStreams';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';

export function EventStreamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: eventStream } = useGet<EdaEventStream>(edaAPI`/event-streams/${params.id ?? ''}/`);
  const patchRequest = usePatchRequest();
  const alertToaster = usePageAlertToaster();

  const toggleEventStreamMode: (testMode: boolean, eventStream: EdaEventStream) => Promise<void> =
    useCallback(
      async (testMode, eventStream) => {
        const alert: AlertProps = {
          variant: 'success',
          title: `${eventStream.name || ''} ${testMode ? t('switched to test mode') : t('switched to production mode')}.`,
          timeout: 5000,
        };
        await patchRequest(
          edaAPI`/event-streams/${eventStream?.id ? eventStream?.id.toString() : ''}/`,
          {
            test_mode: testMode,
          }
        )
          .then(() => alertToaster.addAlert(alert))
          .catch(() => {
            alertToaster.addAlert({
              variant: 'danger',
              title: `${t('Failed to switch the mode for')} ${eventStream.name}`,
              timeout: 5000,
            });
          });
      },
      [t, patchRequest, alertToaster]
    );
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
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TaskIcon,
        label: t('Switch to test mode'),
        isHidden: (eventStream: EdaEventStream) => !!eventStream?.test_mode,
        onClick: (eventStream: EdaEventStream) => toggleEventStreamMode(true, eventStream),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: DatabaseIcon,
        label: t('Switch to production mode'),
        isHidden: (eventStream: EdaEventStream) => !eventStream?.test_mode,
        onClick: (eventStream: EdaEventStream) => toggleEventStreamMode(false, eventStream),
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
    [deleteEventStreams, pageNavigate, t, toggleEventStreamMode]
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
        tabs={[
          { label: t('Details'), page: EdaRoute.EventStreamDetails },
          { label: t('Activations'), page: EdaRoute.EventStreamActivations },
        ]}
        params={{ id: eventStream?.id }}
      />
    </PageLayout>
  );
}
