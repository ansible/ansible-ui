import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaGroup } from '../../../interfaces/EdaGroup';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteGroups } from './useDeleteGroup';

export function useGroupsActions(view: IEdaView<EdaGroup>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteGroups = useDeleteGroups(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaGroup>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create Group'),
        onClick: () => navigate(RouteObj.CreateEdaGroup),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected Groups'),
        onClick: (Groups: EdaGroup[]) => deleteGroups(Groups),
        isDanger: true,
      },
    ],
    [deleteGroups, navigate, t]
  );
}
