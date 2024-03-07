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
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteWebhooks } from './useDeleteWebhooks';

export function useWebhooksActions(view: IEdaView<EdaWebhook>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteWebhooks = useDeleteWebhooks(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaWebhook>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create webhook'),
        onClick: () => pageNavigate(EdaRoute.CreateWebhook),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected webhooks'),
        onClick: (webhooks: EdaWebhook[]) => deleteWebhooks(webhooks),
        isDanger: true,
      },
    ],
    [deleteWebhooks, pageNavigate, t]
  );
}
