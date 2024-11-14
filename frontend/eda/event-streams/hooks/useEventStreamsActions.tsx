import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteEventStreams } from './useDeleteEventStreams';

export function useEventStreamsActions(view: IEdaView<EdaEventStream>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteEventStreams = useDeleteEventStreams(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/event-streams/`);
  const canCreateEventStream = Boolean(data && data.actions && data.actions['POST']);
  return useMemo<IPageAction<EdaEventStream>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create event stream'),
        isDisabled: canCreateEventStream
          ? undefined
          : t(
              'You do not have permission to create a project. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(EdaRoute.CreateEventStream),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected event streams'),
        onClick: (eventStreams: EdaEventStream[]) => deleteEventStreams(eventStreams),
        isDanger: true,
      },
    ],
    [canCreateEventStream, deleteEventStreams, pageNavigate, t]
  );
}
