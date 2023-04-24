import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteObj } from '../../../../Routes';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Project } from '../../../interfaces/Project';
import { useCancelProjects } from './useCancelProjects';
import { useDeleteProjects } from './useDeleteProjects';

import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';

export function useProjectToolbarActions(onComplete: (projects: Project[]) => void) {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/projects/');
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);

  const deleteProjects = useDeleteProjects(onComplete);
  const cancelProjects = useCancelProjects(onComplete);

  const ProjectToolbarActions = useMemo<IPageAction<Project>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create project'),
        isDisabled: canCreateProject
          ? undefined
          : t(
              'You do not have permission to create a project. Please contact your organization administrator if there is an issue with your access.'
            ),
        href: RouteObj.CreateProject,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: deleteProjects,
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: BanIcon,
        label: t('Cancel selected projects'),
        onClick: cancelProjects,
      },
    ],
    [canCreateProject, cancelProjects, deleteProjects, t]
  );

  return ProjectToolbarActions;
}
