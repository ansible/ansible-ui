import { AlertProps } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
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
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { postRequest } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDisableEventStreams, useRestartEventStreams } from '../hooks/useControlEventStreams';
import { useDeleteEventStreams } from '../hooks/useDeleteEventStreams';

export function EventStreamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();
  const { data: eventStream, refresh } = useGet<EdaEventStream>(
    edaAPI`/event-streams/${params.id ?? ''}/`
  );

  const disableEventStream = useDisableEventStreams((disabled) => {
    if (disabled.length > 0) {
      refresh();
    }
  });

  const restartEventStream = useRestartEventStreams((restarted) => {
    if (restarted.length > 0) {
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
        title: `${eventStream.name} ${t('enabled')}.`,
        timeout: 5000,
      };
      await postRequest(edaAPI`/event-streams/${eventStream.id.toString()}/enable/`, undefined)
        .then(() => alertToaster.addAlert(alert))
        .catch(() => {
          alertToaster.addAlert({
            variant: 'danger',
            title: `${t('Failed to enable')} ${eventStream.name}`,
            timeout: 5000,
          });
        });
      refresh();
    },
    [alertToaster, refresh, t]
  );

  const isActionTab = location.href.includes(
    getPageUrl(EdaRoute.EventStreamDetails, { params: { id: eventStream?.id } })
  );

  const itemActions = useMemo<IPageAction<EdaEventStream>[]>(() => {
    const actions: IPageAction<EdaEventStream>[] = isActionTab
      ? [
          {
            type: PageActionType.Switch,
            selection: PageActionSelection.Single,
            ariaLabel: (isEnabled) =>
              isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
            isPinned: true,
            label: t('Event stream enabled'),
            labelOff: t('Event stream disabled'),
            onToggle: (eventStream: EdaEventStream, activate: boolean) => {
              if (activate) void enableEventStream(eventStream);
              else void disableEventStream([eventStream]);
            },
            isSwitchOn: (eventStream: EdaEventStream) => eventStream.is_enabled ?? false,
            isDisabled: (eventStream: EdaEventStream) =>
              eventStream.status === StatusEnum.Stopping
                ? t('Cannot change the event stream status while stopping')
                : undefined,
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            icon: RedoIcon,
            label: t('Restart event stream'),
            isDanger: false,
            isHidden: (eventStream: EdaEventStream) => !eventStream.is_enabled,
            onClick: (eventStream: EdaEventStream) => restartEventStream([eventStream]),
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
        ]
      : [];
    return actions;
  }, [
    isActionTab,
    enableEventStream,
    disableEventStream,
    restartEventStream,
    deleteEventStreams,
    t,
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={eventStream?.name}
        breadcrumbs={[
          { label: t('Event streams'), to: getPageUrl(EdaRoute.EventStreams) },
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
          { label: t('History'), page: EdaRoute.EventStreamHistory },
        ]}
        params={{ id: params.id }}
      />
    </PageLayout>
  );
}
