import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { IPulpView } from '../../usePulpView';
import { IRemotes } from '../Remotes';
import { useDeleteRemotes } from './useDeleteRemotes';

export function useRemoteActions(view: IPulpView<IRemotes>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRemotes = useDeleteRemotes(view.unselectItemsAndRefresh);
  const actions = useMemo<IPageAction<IRemotes>[]>(
    () => [
      {
        icon: EditIcon,
        isPinned: true,
        label: t('Edit remote 2'),
        onClick: (remotes) => pageNavigate(HubRoute.EditRemote, { id: remotes.name }),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      {
        type: PageActionType.Seperator,
      },
      {
        icon: TrashIcon,
        label: t('Delete remote'),
        onClick: (remotes) => deleteRemotes([remotes]),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteRemotes]
  );

  return actions;
}
