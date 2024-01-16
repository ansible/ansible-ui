import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { EdaEventSource } from '../../../interfaces/EdaEventSource';
import { useDeleteEventSources } from './useDeleteEventSources';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaRoute } from '../../../main/EdaRoutes';

export function useEventSourcesActions(view: IEdaView<EdaEventSource>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteEventSources = useDeleteEventSources(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaEventSource>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create event source'),
        onClick: () => pageNavigate(EdaRoute.CreateEventSource),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected event sources'),
        onClick: (eventSources: EdaEventSource[]) => deleteEventSources(eventSources),
        isDanger: true,
      },
    ],
    [deleteEventSources, pageNavigate, t]
  );
}
