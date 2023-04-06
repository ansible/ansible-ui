import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon, BanIcon } from '@patternfly/react-icons';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';
import { useDeleteProjects } from './useDeleteProjects';
import { useCancelProjects } from './useCancelProjects';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';

import { IPageAction, PageActionType } from '../../../../../framework';

export function useProjectToolbarActions(onComplete: (projects: Project[]) => void) {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/projects/');
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);

  const deleteProjects = useDeleteProjects(onComplete);
  const cancelProjects = useCancelProjects(onComplete);

  const ProjectToolbarActions = useMemo<IPageAction<Project>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create project'),
        isDisabled: canCreateProject
          ? undefined
          : t(
              'You do not have permission to create a project. Please contact your Organization Administrator if there is an issue with your access.'
            ),
        href: RouteObj.CreateProject,
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: deleteProjects,
        isDanger: true,
      },
      {
        type: PageActionType.bulk,
        icon: BanIcon,
        label: t('Cancel selected projects'),
        onClick: cancelProjects,
      },
    ],
    [canCreateProject, cancelProjects, deleteProjects, t]
  );

  return ProjectToolbarActions;
}
