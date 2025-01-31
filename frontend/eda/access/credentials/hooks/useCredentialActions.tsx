import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteCredentials } from './useDeleteCredentials';
import { useCopyCredential } from './useCopyCredential';

export function useCredentialActions(view: IEdaView<EdaCredential>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  const copyCredential = useCopyCredential(view.refresh as () => void);
  return useMemo<IPageAction<EdaCredential>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit credential'),
        onClick: (credential: EdaCredential) =>
          pageNavigate(EdaRoute.EditCredential, { params: { id: credential.id } }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t(`Duplicate credential`),
        onClick: (credential: EdaCredential) => {
          return copyCredential(credential);
        },
        isDanger: false,
        isPinned: true,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential'),
        onClick: (credential: EdaCredential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [deleteCredentials, copyCredential, pageNavigate, t]
  );
}
