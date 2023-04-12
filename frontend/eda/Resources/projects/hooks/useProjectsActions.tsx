import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaProject } from '../../../interfaces/EdaProject';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteProjects } from './useDeleteProjects';

export function useProjectsActions(view: IEdaView<EdaProject>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create project'),
        onClick: () => navigate(RouteObj.CreateEdaProject),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: (projects: EdaProject[]) => deleteProjects(projects),
        isDanger: true,
      },
    ],
    [deleteProjects, navigate, t]
  );
}
