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
import { IAwxView } from '../../../common/useAwxView';
import { Credential } from '../../../interfaces/Credential';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteCredentials } from './useDeleteCredentials';

export function useCredentialToolbarActions(view: IAwxView<Credential>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create credential'),
        onClick: () => pageNavigate(AwxRoute.CreateCredential),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected credentials'),
        onClick: deleteCredentials,
        isDanger: true,
      },
    ],
    [pageNavigate, deleteCredentials, t]
  );
  return toolbarActions;
}
