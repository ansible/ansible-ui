import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteControllerTokens } from './useDeleteControllerTokens';
import { ButtonVariant } from '@patternfly/react-core';
import { EdaRoute } from '../../../EdaRoutes';

export function useControllerTokensActions(view: IEdaView<EdaControllerToken>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteControllerTokens = useDeleteControllerTokens(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaControllerToken>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create controller token'),
        onClick: () => pageNavigate(EdaRoute.CreateControllerToken),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected controller tokens'),
        onClick: (controllerTokens: EdaControllerToken[]) =>
          deleteControllerTokens(controllerTokens),
        isDanger: true,
      },
    ],
    [deleteControllerTokens, t]
  );
}
