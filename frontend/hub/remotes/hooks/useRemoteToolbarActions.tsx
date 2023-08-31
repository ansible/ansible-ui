import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../common/Routes';
import { IPulpView } from '../../usePulpView';
import { IRemotes } from '../Remotes';
import { useDeleteRemotes } from './useDeleteRemotes';

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
