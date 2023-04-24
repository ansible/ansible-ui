import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteControllerTokens } from './useDeleteControllerTokens';

export function useControllerTokensActions(view: IEdaView<EdaControllerToken>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        onClick: () => navigate(RouteObj.CreateEdaControllerToken),
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
    [deleteControllerTokens, navigate, t]
  );
}
