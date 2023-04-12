import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { IAwxView } from '../../../useAwxView';
import { useDeleteCredentials } from '../useDeleteCredentials';

export function useCredentialToolbarActions(view: IAwxView<Credential>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create credential'),
        onClick: () => navigate(RouteObj.CreateCredential),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected credentials'),
        onClick: deleteCredentials,
        isDanger: true,
      },
    ],
    [navigate, deleteCredentials, t]
  );
  return toolbarActions;
}
