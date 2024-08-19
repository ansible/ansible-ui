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
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteWebhooks } from './useDeleteWebhooks';

export function useWebhooksActions(view: IEdaView<EdaEventStream>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteWebhooks = useDeleteWebhooks(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaEventStream>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create event stream'),
        onClick: () => pageNavigate(EdaRoute.CreateWebhook),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected event streams'),
        onClick: (webhooks: EdaEventStream[]) => deleteWebhooks(webhooks),
        isDanger: true,
      },
    ],
    [deleteWebhooks, pageNavigate, t]
  );
}
