import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from '../Remotes';
import { useDeleteRemotes } from './useDeleteRemotes';

export function useRemoteActions(options: { onRemotesDeleted: (remotes: HubRemote[]) => void }) {
  const { onRemotesDeleted } = options;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRemotes = useDeleteRemotes(onRemotesDeleted);
  const actions = useMemo<IPageAction<HubRemote>[]>(
    () => [
      {
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit remote'),
        onClick: (remotes) => pageNavigate(HubRoute.EditRemote, { params: { id: remotes.name } }),
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
