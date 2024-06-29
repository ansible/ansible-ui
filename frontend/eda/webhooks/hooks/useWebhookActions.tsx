import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
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

export function useWebhookActions(view: IEdaView<EdaWebhook>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteWebhooks = useDeleteWebhooks(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaWebhook>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit event stream'),
        onClick: (webhook: EdaWebhook) =>
          pageNavigate(EdaRoute.EditWebhook, { params: { id: webhook.id } }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete event stream'),
        onClick: (webhook: EdaWebhook) => deleteWebhooks([webhook]),
        isDanger: true,
      },
    ],
    [deleteWebhooks, pageNavigate, t]
  );
}
