import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteControllerTokens } from './useDeleteControllerTokens';

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
        icon: PlusCircleIcon,
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
    [deleteControllerTokens, pageNavigate, t]
  );
}
