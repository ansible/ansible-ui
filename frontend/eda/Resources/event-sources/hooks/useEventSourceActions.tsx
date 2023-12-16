import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { EdaEventSource } from '../../../interfaces/EdaEventSource';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteEventSources } from './useDeleteEventSources';

export function useEventSourceActions(view: IEdaView<EdaEventSource>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteEventSources = useDeleteEventSources(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaEventSource>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit event source'),
        onClick: (eventSource: EdaEventSource) =>
          pageNavigate(EdaRoute.EditEventSource, {
            params: { id: eventSource.id },
          }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete event source'),
        onClick: (eventSource: EdaEventSource) => deleteEventSources([eventSource]),
        isDanger: true,
      },
    ],
    [deleteEventSources, pageNavigate, t]
  );
}
