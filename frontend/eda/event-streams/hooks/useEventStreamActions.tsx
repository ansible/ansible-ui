import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteEventStreams } from './useDeleteEventStreams';
import { edaAPI } from '../../common/eda-utils';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { useDisableEventStreams } from './useDisableEventStreams';

export function useEventStreamActions(view: IEdaView<EdaEventStream>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const disableEventStreams = useDisableEventStreams(view.unselectItemsAndRefresh);
  const deleteEventStreams = useDeleteEventStreams(view.unselectItemsAndRefresh);
  const patchRequest = usePatchRequest();
  const alertToaster = usePageAlertToaster();

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
      view.unselectItemsAndRefresh([eventStream]);
    },
    [t, patchRequest, view, alertToaster]
  );
  return useMemo<IPageAction<EdaEventStream>[]>(
    () => [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) => (isEnabled ? t('Switch to ') : t('Click to enable instance')),
        selection: PageActionSelection.Single,
        isPinned: true,
        label: t('Events are being forwarded to the rulebook activation.'),
        labelOff: t('Events are not being forwarded to the rulebook activation.'),
        onToggle: (eventStream: EdaEventStream, mode: boolean) => {
          if (mode) void enableEventStream(eventStream);
          else void disableEventStreams([eventStream]);
        },
        isSwitchOn: (eventStream: EdaEventStream) => !eventStream.test_mode,
      },
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
    [deleteEventStreams, disableEventStreams, enableEventStream, pageNavigate, t]
  );
}
