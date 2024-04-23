import { AlertProps } from '@patternfly/react-core';
import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
} from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { useDisableEventStreams, useRestartEventStreams } from './useControlEventStreams';
import { useDeleteEventStreams } from './useDeleteEventStreams';

export function useEventStreamActions(view: IEdaView<EdaEventStream>) {
  const { t } = useTranslation();
  const disableEventStreams = useDisableEventStreams(view.unselectItemsAndRefresh);
  const restartEventStreams = useRestartEventStreams(view.unselectItemsAndRefresh);
  const deleteEventStreams = useDeleteEventStreams(view.unselectItemsAndRefresh);
  const alertToaster = usePageAlertToaster();
  const enableEventStream: (eventStream: EdaEventStream) => Promise<void> = useCallback(
    async (eventStream) => {
      const alert: AlertProps = {
        variant: 'success',
        title: `${eventStream.name} ${t('enabled')}.`,
        timeout: 5000,
      };
      await postRequest(edaAPI`/event-streams/${eventStream.id.toString()}/${'enable/'}`, undefined)
        .then(() => alertToaster.addAlert(alert))
        .catch(() => {
          alertToaster.addAlert({
            variant: 'danger',
            title: `${t('Failed to enable')} ${eventStream.name}`,
            timeout: 5000,
          });
        });
      view.unselectItemsAndRefresh([eventStream]);
    },
    [view, alertToaster, t]
  );

  return useMemo<IPageAction<EdaEventStream>[]>(() => {
    const actions: IPageAction<EdaEventStream>[] = [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
        selection: PageActionSelection.Single,
        isPinned: true,
        label: t('Event stream enabled'),
        labelOff: t('Event stream disabled'),
        onToggle: (eventStream: EdaEventStream, activate: boolean) => {
          if (activate) void enableEventStream(eventStream);
          else void disableEventStreams([eventStream]);
        },
        isSwitchOn: (eventStream: EdaEventStream) => eventStream.is_enabled ?? false,
        isHidden: (eventStream: EdaEventStream) => eventStream?.status === StatusEnum.Deleting,
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
        isHidden: (eventStream: EdaEventStream) =>
          !eventStream.is_enabled || eventStream?.status === StatusEnum.Deleting,
        onClick: (eventStream: EdaEventStream) => restartEventStreams([eventStream]),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete event stream'),
        isHidden: (eventStream: EdaEventStream) => eventStream?.status === StatusEnum.Deleting,
        onClick: (eventStream: EdaEventStream) => deleteEventStreams([eventStream]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, restartEventStreams, deleteEventStreams, disableEventStreams, enableEventStream]);
}
