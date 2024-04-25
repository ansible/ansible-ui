import { ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import {
  cannotDeleteResource,
  cannotEditResource,
  cannotCopyResource,
} from '../../../../common/utils/RBAChelpers';
import { Credential } from '../../../interfaces/Credential';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteCredentials } from './useDeleteCredentials';
import { useCopyCredential } from './useCopyCredential';

export function useCredentialActions(options?: {
  onDeleted: (credentials: Credential[]) => void;
  onCredentialCopied?: () => void;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCredentials = useDeleteCredentials(options?.onDeleted);
  const copyCredential = useCopyCredential(options?.onCredentialCopied);
  const rowActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit credential'),
        isDisabled: (credential) => cannotEditResource(credential, t),
        onClick: (credential) =>
          pageNavigate(AwxRoute.EditCredential, { params: { id: credential.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t(`Copy credential`),
        onClick: (credential: Credential) => copyCredential(credential),
        isDisabled: (credential) => cannotCopyResource(credential, t),
        isDanger: false,
        isPinned: true,
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
    [pageNavigate, copyCredential, deleteCredentials, t]
  );
  return rowActions;
}
