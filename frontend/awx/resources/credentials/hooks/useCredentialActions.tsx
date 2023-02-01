import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { useDeleteCredentials } from '../useDeleteCredentials';

export function useCredentialActions(options?: { onDeleted: (cred: Credential[]) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCredentials = useDeleteCredentials(options?.onDeleted);
  const rowActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        variant: ButtonVariant.primary,
        isHidden: (credential: Credential) =>
          credential?.summary_fields?.user_capabilities.edit === false,
        label: t('Edit credential'),
        onClick: (credential: Credential) =>
          navigate(RouteObj.EditCredential.replace(':id', credential.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        isHidden: (credential: Credential) =>
          credential?.summary_fields?.user_capabilities?.delete === false,
        variant: ButtonVariant.danger,
        label: t('Delete credential'),
        onClick: (credential: Credential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [navigate, deleteCredentials, t]
  );
  return rowActions;
}
