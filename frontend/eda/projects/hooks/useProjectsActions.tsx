import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaProject } from '../../interfaces/EdaProject';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteProjects } from './useDeleteProjects';

export function useProjectsActions(view: IEdaView<EdaProject>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/projects/`);
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);
  return useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create project'),
        isDisabled: canCreateProject
          ? undefined
          : t(
              'You do not have permission to create a project. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(EdaRoute.CreateProject),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete projects'),
        onClick: (projects: EdaProject[]) => deleteProjects(projects),
        isDanger: true,
      },
    ],
    [canCreateProject, deleteProjects, pageNavigate, t]
  );
}
