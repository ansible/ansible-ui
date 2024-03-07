import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDisableEventStreams, useRestartEventStreams } from './useControlEventStreams';
import { useDeleteEventStreams } from './useDeleteEventStreams';

export function useEventStreamsActions(view: IEdaView<EdaEventStream>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteEventStreams = useDeleteEventStreams(view.unselectItemsAndRefresh);
  const disableEventStreams = useDisableEventStreams(view.unselectItemsAndRefresh);
  const restartEventStreams = useRestartEventStreams(view.unselectItemsAndRefresh);
  const alertToaster = usePageAlertToaster();

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
    },
    [alertToaster, t]
  );
  const enableEventStreams = useCallback(
    (eventStreams: EdaEventStream[]) => {
      for (const eventStream of eventStreams) {
        void enableEventStream(eventStream);
      }
    },
    [enableEventStream]
  );

  return useMemo<IPageAction<EdaEventStream>[]>(() => {
    const actions: IPageAction<EdaEventStream>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create event stream'),
        onClick: () => pageNavigate(EdaRoute.CreateEventStream),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Enable selected event streams'),
        onClick: (eventStreams: EdaEventStream[]) => enableEventStreams(eventStreams),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Disable selected event streams'),
        onClick: (eventStreams: EdaEventStream[]) => disableEventStreams(eventStreams),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: RedoIcon,
        label: t('Restart selected event streams'),
        onClick: (eventStreams: EdaEventStream[]) => restartEventStreams(eventStreams),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected event streams'),
        onClick: (eventStreams: EdaEventStream[]) => deleteEventStreams(eventStreams),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    deleteEventStreams,
    enableEventStreams,
    disableEventStreams,
    restartEventStreams,
    pageNavigate,
    t,
  ]);
}
