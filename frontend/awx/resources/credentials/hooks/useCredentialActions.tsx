import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { Credential } from '../../../interfaces/Credential';
import { useDeleteCredentials } from './useDeleteCredentials';

export function useCredentialActions(options?: { onDeleted: (credentials: Credential[]) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCredentials = useDeleteCredentials(options?.onDeleted);
  const rowActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit credential'),
        isDisabled: (credential) => cannotEditResource(credential, t),
        onClick: (credential) =>
          navigate(RouteObj.EditCredential.replace(':id', credential.id.toString())),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential'),
        isDisabled: (credential) => cannotDeleteResource(credential, t),
        onClick: (credential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [navigate, deleteCredentials, t]
  );
  return rowActions;
}
