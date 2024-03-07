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
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
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
        icon: PlusCircleIcon,
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
