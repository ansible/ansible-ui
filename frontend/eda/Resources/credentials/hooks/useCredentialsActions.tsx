import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteCredentials } from './useDeleteCredentials';

export function useCredentialsActions(view: IEdaView<EdaCredential>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaCredential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create credential'),
        onClick: () => pageNavigate(EdaRoute.CreateCredential),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected credentials'),
        onClick: (credentials: EdaCredential[]) => deleteCredentials(credentials),
        isDanger: true,
      },
    ],
    [deleteCredentials, pageNavigate, t]
  );
}
