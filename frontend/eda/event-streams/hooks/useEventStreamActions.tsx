import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { ConnectedIcon, DisconnectedIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
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

export function useEventStreamActions(view: IEdaView<EdaEventStream>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteEventStreams = useDeleteEventStreams(view.unselectItemsAndRefresh);
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
        view.unselectItemsAndRefresh([eventStream]);
      },
      [t, patchRequest, view, alertToaster]
    );
  return useMemo<IPageAction<EdaEventStream>[]>(
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
        icon: DisconnectedIcon,
        label: t('Switch to test mode'),
        isHidden: (eventStream: EdaEventStream) => !!eventStream?.test_mode,
        onClick: (eventStream: EdaEventStream) => toggleEventStreamMode(true, eventStream),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: ConnectedIcon,
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
}
