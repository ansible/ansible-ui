import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteEventStreams } from './useDeleteEventStreams';

export function useEventStreamsActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteEventStreams = useDeleteEventStreams(() => void refresh());
  return useMemo<IPageAction<EdaEventStream>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t(' event stream'),
        onClick: () => pageNavigate(EdaRoute.CreateEventStream),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected event streams'),
        onClick: (eventStreams: EdaEventStream[]) => deleteEventStreams(eventStreams),
      },
    ],
    [deleteEventStreams, pageNavigate, t]
  );
}
