import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
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
import { useDisableEventStreams } from '../hooks/useDisableEventStreams';
import { EdaResult } from '../../interfaces/EdaResult';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';

export function EventStreamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/event-streams/${params.id ?? ''}/`
  );
  const canEditEventStream = Boolean(data && data.actions && data.actions['PATCH']);
  const { data: eventStream, refresh } = useGet<EdaEventStream>(
    edaAPI`/event-streams/${params.id ?? ''}/`
  );
  const getPageUrl = useGetPageUrl();
  const patchRequest = usePatchRequest();
  const alertToaster = usePageAlertToaster();
  const disableEventStreams = useDisableEventStreams((disabled) => {
    if (disabled.length > 0) {
      refresh();
    }
  });

  const deleteEventStreams = useDeleteEventStreams((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.EventStreams);
    }
  });

  const enableEventStream: (eventStream: EdaEventStream) => Promise<void> = useCallback(
    async (eventStream) => {
      const alert: AlertProps = {
        variant: 'success',
        title: `${eventStream.name || ''}  ${t('switched to production mode.')}`,
        timeout: 5000,
      };
      await patchRequest(
        edaAPI`/event-streams/${eventStream?.id ? eventStream?.id.toString() : ''}/`,
        {
          test_mode: false,
        }
      )
        .then(() => alertToaster.addAlert(alert))
        .catch(() => {
          alertToaster.addAlert({
            variant: 'danger',
            title: `${t('Failed to enable the forwarding of events for')} ${eventStream.name}`,
            timeout: 5000,
          });
        });
      refresh();
    },
    [t, patchRequest, refresh, alertToaster]
  );
  const { data: esActivations } = useGet<EdaResult<EdaEventStream>>(
    edaAPI`/event-streams/${params.id ?? ''}/activations/?page=1&page_size=200`
  );

  const isActionTab = location.href.includes(
    getPageUrl(EdaRoute.EventStreamDetails, { params: { id: eventStream?.id } })
  );
  const itemActions = useMemo<IPageAction<EdaEventStream>[]>(
    () =>
      isActionTab
        ? [
            {
              type: PageActionType.Switch,
              ariaLabel: (isEnabled) =>
                isEnabled ? t('Forward events ') : t('Not forwarding events'),
              selection: PageActionSelection.Single,
              isPinned: true,
              label: t('Forward events'),
              labelOff: t('Forward events'),
              onToggle: (eventStream: EdaEventStream, mode: boolean) => {
                if (mode) void enableEventStream(eventStream);
                else void disableEventStreams([eventStream]);
              },
              isSwitchOn: (eventStream: EdaEventStream) => !eventStream.test_mode,
              isDisabled: () =>
                canEditEventStream
                  ? ''
                  : t(`The event stream cannot be updated due to insufficient permission`),
            },
            {
              type: PageActionType.Button,
              variant: ButtonVariant.primary,
              selection: PageActionSelection.Single,
              icon: PencilAltIcon,
              isPinned: true,
              label: t('Edit event stream'),
              isDisabled: () =>
                canEditEventStream
                  ? ''
                  : t(`The event stream cannot be edited due to insufficient permission`),
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
              isDisabled: () => {
                if (canEditEventStream) {
                  return esActivations?.results && esActivations.results.length > 0
                    ? t('To delete this event stream, disconnect it from all rulebook activations')
                    : '';
                } else {
                  return t(`The event stream cannot be deleted due to insufficient permission`);
                }
              },
              onClick: (eventStream: EdaEventStream) => deleteEventStreams([eventStream]),
              isDanger: true,
            },
          ]
        : [],
    [
      canEditEventStream,
      deleteEventStreams,
      disableEventStreams,
      enableEventStream,
      esActivations,
      isActionTab,
      pageNavigate,
      t,
    ]
  );

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
          { label: t('Team Access'), page: EdaRoute.EventStreamTeamAccess },
          { label: t('User Access'), page: EdaRoute.EventStreamUserAccess },
        ]}
        params={{ id: eventStream?.id }}
      />
    </PageLayout>
  );
}
