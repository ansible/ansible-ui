import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { ButtonVariant } from '@patternfly/react-core';
import { IRemotes } from '../Remotes';
import { RouteObj } from '../../../Routes';
import { useNavigate } from 'react-router-dom';
import { useDeleteRemotes } from './useDeleteRemotes';
import { IPulpView } from '../../usePulpView';

export function useRemoteToolbarActions(view: IPulpView<IRemotes>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRemotes = useDeleteRemotes(view.unselectItemsAndRefresh);
  const actions = useMemo<IPageAction<IRemotes>[]>(
    () => [
      {
        icon: PlusIcon,
        isPinned: true,
        label: t('Create remote'),
        onClick: () => navigate(RouteObj.CreateRemotes),
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected remotes'),
        onClick: deleteRemotes,
        isDanger: true,
      },
    ],
    [t, navigate, deleteRemotes]
  );

  return actions;
}
