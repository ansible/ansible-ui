import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCancelProjects } from './useCancelProjects';
import { useDeleteProjects } from './useDeleteProjects';

export function useProjectToolbarActions(onComplete: (projects: Project[]) => void) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/projects/`);
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
        icon: PlusCircleIcon,
        label: t('Create project'),
        isDisabled: canCreateProject
          ? undefined
          : t(
              'You do not have permission to create a project. Please contact your organization administrator if there is an issue with your access.'
            ),
        href: getPageUrl(AwxRoute.CreateProject),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: BanIcon,
        label: t('Cancel selected projects'),
        onClick: cancelProjects,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: deleteProjects,
        isDanger: true,
      },
    ],
    [canCreateProject, cancelProjects, deleteProjects, getPageUrl, t]
  );

  return ProjectToolbarActions;
}
