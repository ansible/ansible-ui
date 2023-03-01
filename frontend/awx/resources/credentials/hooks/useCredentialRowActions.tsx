import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { IAwxView } from '../../../useAwxView';
import { useDeleteCredentials } from '../useDeleteCredentials';

export function useCredentialRowActions(view: IAwxView<Credential>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  const rowActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        variant: ButtonVariant.primary,
        label: t('Edit credential'),
        onClick: (credential) =>
          navigate(RouteObj.EditCredential.replace(':id', credential.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete credential'),
        onClick: (credential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [navigate, deleteCredentials, t]
  );
  return rowActions;
}
